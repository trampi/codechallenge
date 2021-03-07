# Documentation

This is a small sample project for a coding challenge.

## closing thoughts
* no code generator was used
* the report generators are coded really near to the requirements
  * It would not be too hard to refactor them to be parameterized (e.g. filter by date range or by make, ...)
* I did not add human readable errors for the csv import to cut time
* cut tests for the last report
* no code generator was used
  * openapi would be nice for the other developers 
  * jsonschema for input validation would be nice, too. I hand rolled it
* used sqlite for storing the imported data
* doing everything in memory would have been possible too

## running
```bash
# instal dependencies
npm install

# start application
npm start

# run tests
npm test
```

## endpoints
* http://localhost:3000/ will produce html reports
* http://localhost:3000/json will produce reports as json
