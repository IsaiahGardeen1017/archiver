const SALT_LENGTH_BYTES = 16; // Standard length for salts
const IV_LENGTH_BYTES = 12; // Standard length for AES-GCM IVs

/**
 * Encrypts data using a password and returns a Uint8Array containing
 * the salt, IV, and encrypted data, concatenated in that order.
 *
 * Structure of returned Uint8Array: [SALT_LENGTH_BYTES][IV_LENGTH_BYTES][encrypted_data]
 *
 * @param data The plaintext data as a Uint8Array.
 * @param password The password string to derive the encryption key.
 * @returns A Uint8Array containing the salt, IV, and encrypted data.
 */
export async function encrypt(data: Uint8Array<ArrayBuffer>, password: string): Promise<Uint8Array<ArrayBuffer>> {
	// 1. Generate Salt
	const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH_BYTES));

	// 2. Derive Key from Password and Salt using PBKDF2
	const passwordKey = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password), // Passwords should be handled securely, e.g., prompt for it
		{ name: 'PBKDF2' },
		false,
		['deriveBits', 'deriveKey'],
	);

	const aesKey = await crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: salt,
			iterations: 100000, // Important: Use a high iteration count for security
			hash: 'SHA-256', // Use a strong hash function
		},
		passwordKey,
		{ name: 'AES-GCM', length: 256 }, // Use AES-256 GCM for strong encryption
		true, // Key is extractable (good for storing and sharing the key itself, but we're just deriving it here)
		['encrypt', 'decrypt'], // Key can be used for encryption and decryption
	);

	// 3. Generate IV
	const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES)); // 12 bytes for AES-GCM

	// 4. Encrypt Data
	const encryptedBuffer = await crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv: iv,
		},
		aesKey,
		data,
	);
	const encryptedData = new Uint8Array(encryptedBuffer);

	// 5. Concatenate Salt, IV, and Encrypted Data
	const result = new Uint8Array(
		salt.length + iv.length + encryptedData.length,
	);
	result.set(salt, 0);
	result.set(iv, salt.length);
	result.set(encryptedData, salt.length + iv.length);

	return result;
}

/**
 * Decrypts data that was encrypted using the `encrypt` function.
 * It expects the input Uint8Array to have the salt, IV, and encrypted data
 * concatenated in that order.
 *
 * Structure of input Uint8Array: [SALT_LENGTH_BYTES][IV_LENGTH_BYTES][encrypted_data]
 *
 * @param data The concatenated Uint8Array (salt + IV + encrypted data).
 * @param password The password string used for encryption.
 * @returns The decrypted plaintext data as a Uint8Array, or throws an error
 *          if decryption fails (e.g., wrong password, tampered data).
 */
export async function decrypt(data: Uint8Array<ArrayBuffer>, password: string): Promise<Uint8Array<ArrayBuffer>> {
	// 1. Extract Salt and IV from the input data
	if (data.length < SALT_LENGTH_BYTES + IV_LENGTH_BYTES) {
		throw new Error('Invalid data format: too short to contain salt and IV.');
	}

	const salt = data.slice(0, SALT_LENGTH_BYTES);
	const iv = data.slice(SALT_LENGTH_BYTES, SALT_LENGTH_BYTES + IV_LENGTH_BYTES);
	const encryptedData = data.slice(SALT_LENGTH_BYTES + IV_LENGTH_BYTES);
	// 2. Derive Key from Password and Extracted Salt
	const passwordKey = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password),
		{ name: 'PBKDF2' },
		false,
		['deriveBits', 'deriveKey'],
	);

	const aesKey = await crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: salt,
			iterations: 100000, // Must match encryption iterations
			hash: 'SHA-256', // Must match encryption hash
		},
		passwordKey,
		{ name: 'AES-GCM', length: 256 },
		true,
		['encrypt', 'decrypt'],
	);

	// 3. Decrypt Data
	try {
		const decryptedBuffer = await crypto.subtle.decrypt(
			{
				name: 'AES-GCM',
				iv: iv,
			},
			aesKey,
			encryptedData,
		);
		return new Uint8Array(decryptedBuffer);
	} catch (error) {
		// AES-GCM will throw an error if the key is incorrect or data is tampered with
		console.error('Decryption failed:', error);
		throw new Error(
			'Decryption failed. This could be due to an incorrect password or corrupted/tampered data.',
		);
	}
}
