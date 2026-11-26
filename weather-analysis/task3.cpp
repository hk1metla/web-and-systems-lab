#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>

int main() {
    std::vector<int> years;
    std::vector<double> temperatures;
    std::string filename = "weather_data_EU_1980-2019_temp_only.csv";
    std::ifstream inputFile(filename);

    if (!inputFile) {
        std::cerr << "Error opening file: " << filename << std::endl;
        return 1;
    }

    std::string line;
    
    std::getline(inputFile, line);

    int year;
    double temperature;
    while (std::getline(inputFile, line)) {
        std::stringstream ss(line);
        std::string yearStr, tempStr;

       
        std::getline(ss, yearStr, ',');
        std::getline(ss, tempStr, ',');

       
        year = std::stoi(yearStr);
        temperature = std::stod(tempStr);

      
        years.push_back(year);
        temperatures.push_back(temperature);
    }

    inputFile.close();

    std::cout << "You can start now" << std::endl;
    std::cout << "Please enter the year: ";
    std::cin >> year;

    bool found = false;
    for (size_t i = 0; i < years.size(); ++i) {
        if (years[i] == year) {
            std::cout << "The temperature for the year " << year << " is " << temperatures[i] << " degrees." << std::endl;
            found = true;
            break;
        }
    }

    if (!found) {
        std::cout << "No data available for the year " << year << "." << std::endl;
    }

    return 0;
}

