/**
 * Read a file and return a string of file data
 * @param {*} file 
 */
const readFile = file => {
    let rawFile = new XMLHttpRequest();
    rawFile.open("GET",file,false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                // console.log(rawFile.responseText)
            }
        }
    }
    rawFile.send(null);
    return rawFile.responseText
}

/**
 * Convert A CSV file to Json
 */
const csvToJson = csv =>{
    // let lines = csv.split("/\r\n|\n/");
    let lines = csv.split("\n");

    let result = [];

    let headers = lines[0].split(',');

    for(let i = 1; i < lines.length; i++){
        let obj = {}

        let currentLine = lines[i].split(',');
        
        for(let j = 0; j < headers.length; j++){
            obj[headers[j]] = currentLine[j];
        }
        result.push(obj);
    }

    // console.log(result);
    return result;

}

/**
 * CONVERT SCORE TO GRADE
 * @param int score
 */
const scoreToGrade = score => {
    if (isNaN(score)) {
        return null;
    }
    if (score > 69 && score < 101) {
        return "A"
    }

    if (score > 59) {
        return "B"
    }

    if (score > 49) {
        return "C"
    }

    if (score > 44) {
        return "D"
    }
    if (score > 39) {
        return "E"
    }

    if (score >= 0) {
        return "F"
    }

    return null;

}

/**
 * CONVERT SCORE TO Index
 * @param int score
 */
const scoreToIndex = score => {
    if (isNaN(score)) {
        return null;
    }
    if (score > 69 && score < 101) {
        return 5
    }

    if (score > 59) {
        return 4
    }

    if (score > 49) {
        return 3
    }

    if (score > 44) {
        return 2
    }
    if (score > 39) {
        return 1
    }

    if (score >= 0) {
        return 0
    }

    return 0;

}
