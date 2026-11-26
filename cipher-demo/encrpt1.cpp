#include <iostream>
#include <string>

using namespace std;

string encrypt(string plaintext, string key) {
    string ciphertext = "";
    int keyLength = key.length();
    int plaintextLength = plaintext.length();

    for (int i = 0; i < plaintextLength; ++i) {
        // Convert each letter to its numerical equivalent
        int ptVal = plaintext[i] - 'A';
        int keyVal = key[i % keyLength] - 'A';
        
        // Perform modular addition and convert back to a letter
        char cipherChar = (ptVal + keyVal) % 26 + 'A';
        ciphertext += cipherChar;
    }

    return ciphertext;
}

int main() {
    string plaintext = "SHAHZAIB";
    string key = "THISISANEXAMPLEKEYINCOMPUTERSECURITYEXAM";

    // Ensure the plaintext is in uppercase
    for (int i = 0; i < plaintext.length(); ++i) {
        plaintext[i] = toupper(plaintext[i]);
    }

    string ciphertext = encrypt(plaintext, key);

    cout << "Plaintext: " << plaintext << endl;
    cout << "Key: " << key << endl;
    cout << "Ciphertext: " << ciphertext << endl;

    return 0;
}

