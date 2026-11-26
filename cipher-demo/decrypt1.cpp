#include <iostream>
#include <string>

using namespace std;

string decrypt(string cipherText, string key) {
    string plaintext = "";
    int keyLength = key.length();
    int cipherLength = cipherText.length();

    // Ensure the key is at least as long as the cipher text
    if (keyLength < cipherLength) {
        cout << "Key length must be at least as long as the cipher text length." << endl;
        return "";
    }

    for (int i = 0; i < cipherLength; i++) {
        // Convert letters to numbers (A=0, B=1, ..., Z=25)
        int cipherNum = cipherText[i] - 'A';
        int keyNum = key[i] - 'A';

        // Decrypt using modular subtraction
        int plainNum = (cipherNum - keyNum + 26) % 26;

        // Convert number back to letter
        plaintext += (plainNum + 'A');
    }

    return plaintext;
}

int main() {
    string cipherText = "LOIZHSIO";
    string key = "THISISANEXAMPLEKEYINCOMPUTERSECURITYEXAM"; // Use only the first 8 characters for the length of the cipher text
    key = key.substr(0, cipherText.length());

    string plaintext = decrypt(cipherText, key);

    cout << "Cipher Text: " << cipherText << endl;
    cout << "Key: " << key << endl;
    cout << "Decrypted Plaintext: " << plaintext << endl;

    return 0;
}

