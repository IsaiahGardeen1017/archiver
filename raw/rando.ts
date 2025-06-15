export function getRandomInt(max: number): number {
	if (max < 0 || !Number.isInteger(max)) {
		return 0;
	}

	// Create a Uint32Array with one element
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);

	// Scale the random value to the range [0, max]
	// array[0] is a 32-bit unsigned integer between 0 and 2^32 - 1
	const randomNumber = array[0] / (0xffffffff + 1); // normalize to [0, 1)
	return Math.floor(randomNumber * (max + 1));
}
