# Weather Analysis in C++

Four recovered programs cover CSV parsing, temperature summaries, text plots and a small prediction exercise.

```bash
g++ -std=c++17 calculation.cpp -o calculation
./calculation
```

Each file has its own `main` and must be compiled separately. They expect `weather_data_EU_1980-2019_temp_only.csv` in the working directory. That historical dataset was not recovered alongside these files and is not bundled. Compilation does not establish numerical correctness or forecast quality.
