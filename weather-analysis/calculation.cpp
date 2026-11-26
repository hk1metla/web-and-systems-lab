#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <sstream>
#include <map>
#include <algorithm>
#include <numeric>
#include <limits>
#include <cstdlib>  
#include <iomanip>  


class Candlestick {
public:
    std::string date;
    double open;
    double high;
    double low;
    double close;

    Candlestick(const std::string& date, double open, double high, double low, double close)
        : date(date), open(open), high(high), low(low), close(close) {}
};


std::vector<Candlestick> computeCandlestickData(const std::map<std::string, std::vector<double>>& tempData) {
    std::vector<Candlestick> candlesticks;
    double previousClose = 0.0;

    for (std::map<std::string, std::vector<double>>::const_iterator it = tempData.begin(); it != tempData.end(); ++it) {
        const std::string& date = it->first;
        const std::vector<double>& temperatures = it->second;

        if (temperatures.empty()) continue;

        double high = *std::max_element(temperatures.begin(), temperatures.end());
        double low = *std::min_element(temperatures.begin(), temperatures.end());
        double close = std::accumulate(temperatures.begin(), temperatures.end(), 0.0) / temperatures.size();

        double open = (candlesticks.empty()) ? close : previousClose;

        candlesticks.push_back(Candlestick(date, open, high, low, close));

        previousClose = close;
    }

    return candlesticks;
}


std::map<std::string, std::vector<double>> readTemperatureData(const std::string& filename) {
    std::ifstream file(filename.c_str());
    std::string line;
    std::map<std::string, std::vector<double>> tempData;

    if (!file.is_open()) {
        std::cerr << "Failed to open the file: " << filename << std::endl;
        return tempData;
    }

    while (std::getline(file, line)) {
        std::istringstream iss(line);
        std::string date, tempStr;
        std::getline(iss, date, ',');
        std::vector<double> temperatures;

        while (std::getline(iss, tempStr, ',')) {
            char* end;
            double temp = std::strtod(tempStr.c_str(), &end);
            if (*end == '\0') {
                temperatures.push_back(temp);
            } else {
                std::cerr << "Invalid temperature value: " << tempStr << " in date: " << date << std::endl;
            }
        }

        tempData[date] = temperatures;
    }

    file.close();
    return tempData;
}


std::vector<Candlestick> aggregateYearlyData(const std::map<std::string, std::vector<double>>& tempData) {
    std::map<std::string, std::vector<double>> yearlyData;

    for (const auto& entry : tempData) {
        std::string year = entry.first.substr(0, 4); // Extract the year from the date
        yearlyData[year].insert(yearlyData[year].end(), entry.second.begin(), entry.second.end());
    }

    return computeCandlestickData(yearlyData);
}

int main() {
 
    std::string filename = "weather_data_EU_1980-2019_temp_only.csv";

 
    std::map<std::string, std::vector<double>> tempData = readTemperatureData(filename);

 
    if (tempData.empty()) {
        std::cerr << "No data read from file or file is empty." << std::endl;
        return 1;
    }

 
    std::vector<Candlestick> candlesticks = aggregateYearlyData(tempData);

 
    if (candlesticks.empty()) {
        std::cerr << "No candlestick data computed. Check input data." << std::endl;
        return 1;
    }

 
    std::cout << std::left << std::setw(12) << "Date"
              << std::setw(10) << "Open"
              << std::setw(10) << "High"
              << std::setw(10) << "Low"
              << std::setw(10) << "Close" << std::endl;
    for (const auto& candle : candlesticks) {
        std::cout << std::left << std::setw(12) << candle.date
                  << std::setw(10) << candle.open
                  << std::setw(10) << candle.high
                  << std::setw(10) << candle.low
                  << std::setw(10) << candle.close << std::endl;
    }

    return 0;
}

