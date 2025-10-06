#!/bin/bash

# --- Configuration ---
# Set the directory where your media files are located
# IMPORTANT: Make sure this path is correct.
# Example: media_directory="/home/user/my_media"
media_directory="./" # Current directory, change if needed
# ---------------------

echo "Starting file hashing and renaming process in: $media_directory"
echo "----------------------------------------------------"

# Navigate to the specified directory
cd "$media_directory" || { echo "Error: Directory '$media_directory' not found."; exit 1; }

# Create a temporary file to store hashes and original names to detect duplicates
temp_hash_file=$(mktemp)

for file_path in *; do
    if [ -f "$file_path" ]; then # Process only regular files
        filename=$(basename -- "$file_path")
        extension="${filename##*.}"
        name_without_extension="${filename%.*}"

        # If the file has no extension (e.g., if you skipped the previous step for some files)
        # we'll treat the entire name as the base name. You might want to adjust this logic.
        if [ "$filename" = "$extension" ]; then # No '.' found, so filename IS the extension part
            extension="" # No extension
            name_without_extension="$filename"
        fi

        # Calculate the SHA256 hash
        # Use shasum for macOS/BSD, sha256sum for Linux
        if command -v shasum &> /dev/null; then
            file_hash=$(shasum -a 256 "$file_path" | awk '{print $1}')
        elif command -v sha256sum &> /dev/null; then
            file_hash=$(sha256sum "$file_path" | awk '{print $1}')
        else
            echo "Error: Neither 'shasum' nor 'sha256sum' found. Please install one to proceed."
            rm "$temp_hash_file"
            exit 1
        fi

        # Construct the new filename
        if [ -n "$extension" ]; then # If there's an extension
            new_filename="${file_hash}.${extension}"
        else # If there's no extension
            new_filename="$file_hash"
        fi

        # Check for duplicates before renaming
        # This checks if a file with this hash (and potentially a different original name)
        # has already been processed and its hash stored.
        if grep -q "^$file_hash " "$temp_hash_file"; then
            existing_original_name=$(grep "^$file_hash " "$temp_hash_file" | head -n 1 | awk '{print $2}')
            echo "Duplicate found! Original file '$filename' has hash '$file_hash', which matches '$existing_original_name'."
            echo "Keeping '$existing_original_name' (already processed/renamed) and removing '$filename'."
            rm "$file_path"
        else
            # Rename the file
            if [ "$filename" != "$new_filename" ]; then # Only rename if the name actually changes
                mv "$file_path" "$new_filename"
                echo "Renamed '$filename' to '$new_filename'"
            else
                echo "File '$filename' already named by hash. Skipping."
            fi
            # Store the hash and original filename (before this script's rename)
            echo "$file_hash $filename" >> "$temp_hash_file"
        fi
    fi
done

echo "----------------------------------------------------"
echo "Processing complete."
echo "Any remaining files that have the same hash as another file"
echo "were considered duplicates and removed. Check output for details."

# Clean up the temporary file
rm "$temp_hash_file"