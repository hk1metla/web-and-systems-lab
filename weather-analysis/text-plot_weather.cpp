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

    for (auto it = tempData.begin(); it != tempData.end(); ++it) {
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


void plotCandlestickData(const std::vector<Candlestick>& candlesticks) {
    const int plotHeight = 20;
    const int plotWidth = 30; // Width for each candlestick plot


    double globalMin = std::numeric_limits<double>::max();
    double globalMax = std::numeric_limits<double>::min();

    for (const auto& candle : candlesticks) {
        if (candle.low < globalMin) globalMin = candle.low;
        if (candle.high > globalMax) globalMax = candle.high;
    }

    auto scale = [&](double value) -> int {
        return static_cast<int>((value - globalMin) / (globalMax - globalMin) * (plotHeight - 1));
    };

    for (const auto& candle : candlesticks) {
        std::vector<std::string> plot(plotHeight, std::string(plotWidth, ' '));

        int yOpen = scale(candle.open);
        int yClose = scale(candle.close);
        int yHigh = scale(candle.high);
        int yLow = scale(candle.low);


        for (int y = yLow; y <= yHigh; ++y) {
            plot[y][plotWidth / 2] = '|';
        }


        plot[yOpen][plotWidth / 2 - 1] = '-';
        plot[yOpen][plotWidth / 2 + 1] = '-';
        plot[yClose][plotWidth / 2 - 1] = '-';
        plot[yClose][plotWidth / 2 + 1] = '-';


        plot[yOpen].replace(0, 6, "Open: " + std::to_string(candle.open));
        plot[yHigh].replace(0, 6, "High: " + std::to_string(candle.high));
        plot[yLow].replace(0, 6, "Low: " + std::to_string(candle.low));
        plot[yClose].replace(0, 6, "Close: " + std::to_string(candle.close));


        std::cout << "Year: " << candle.date << std::endl;
        for (int y = plotHeight - 1; y >= 0; --y) {
            std::cout << plot[y] << std::endl;
        }
        std::cout << std::endl;
    }
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


    plotCandlestickData(candlesticks);

    return 0;
}

