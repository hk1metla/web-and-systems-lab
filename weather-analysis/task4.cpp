#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>
#include <stdexcept>

class TemperatureData {
private:
    std::vector<int> years;
    std::vector<double> temperatures;

public:
    TemperatureData(const std::string &filename) {
        readData(filename);
    }

    void readData(const std::string &filename) {
        std::ifstream file(filename);
        if (!file.is_open()) {
            throw std::runtime_error("Unable to open file");
        }

        std::string line;
        
        std::getline(file, line);
        while (std::getline(file, line)) {
            std::stringstream ss(line);
            std::string year, temperature;
            std::getline(ss, year, ',');
            std::getline(ss, temperature, ',');

            years.push_back(std::stoi(year));
            temperatures.push_back(std::stod(temperature));
        }
    }

    double calculateAverageTemperature(int year) const {
        double sum = 0;
        int count = 0;
        for (size_t i = 0; i < years.size(); ++i) {
            if (years[i] == year) {
                sum += temperatures[i];
                ++count;
            }
        }

        if (count == 0) {
            throw std::runtime_error("Year not found in data");
        }

        return sum / count;
    }

    void displayTemperatureChange(int startYear, int endYear) const {
        try {
            double startYearAvgTemp = calculateAverageTemperature(startYear);
            double endYearAvgTemp = calculateAverageTemperature(endYear);
            double temperatureChange = endYearAvgTemp - startYearAvgTemp;

            std::cout << "Average temperature in " << startYear << ": " << startYearAvgTemp << "°C\n";
            std::cout << "Average temperature in " << endYear << ": " << endYearAvgTemp << "°C\n";
            std::cout << "Temperature change from " << startYear << " to " << endYear << ": " << temperatureChange << "°C\n";
        } catch (const std::runtime_error &ex) {
            std::cerr << "Error: " << ex.what() << "\n";
        }
    }
};

int main() {
    try {
        TemperatureData temperatureData("weather_data_EU_1980-2019_temp_only.csv");
        int startYear, endYear;
        std::cout << "Enter the start year: ";
        std::cin >> startYear;
        std::cout << "Enter the end year: ";
        std::cin >> endYear;
        temperatureData.displayTemperatureChange(startYear, endYear);
    } catch (const std::exception &ex) {
        std::cerr << "Error: " << ex.what() << "\n";
        return 1;
    }
    return 0;
}

