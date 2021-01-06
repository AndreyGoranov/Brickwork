const readline = require('readline');

const startQuestions = () => {
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve, reject) => {
      rl.question('Enter area dimensions ', (answer) => {
        console.log(`Dimensions you entered: ${answer}`);
        rl.close();
        resolve(answer);
      });
    }).then(answer => {
        let clearAnswer = answer.replace(/ /g,'');
        if(clearAnswer.length !== 2) {
            throw("wrong dimensions input!");
        } else {
            let [n, m] = clearAnswer.split('');
            n = Number(n);
            m = Number(m);
            let questions = [];
            for (let i = 0; i < n; i++) {
                if (i === 0) {
                    questions.push('insert first line with space between numbers: ');
                } else if (i === n - 1) {
                    questions.push('insert last line with space between numbers: ');
                } else {
                    questions.push('insert next line with space between numbers: ');
                }
            }
            ask(questions).then(results => {
                let clearedArguments = [];
                results.forEach(line => {
                    console.log(line);
                    if (line.split(' ').length === m) {
                        clearedArguments.push(line);
                    } else {
                        throw('wrong line input!');
                    }
                });
                brickWork(n, m, clearedArguments);
            });
        }
    });
  }

const askQuestion = (rl, question) => {
    return new Promise(resolve => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

const ask = function(questions) {
    return new Promise(async resolve => {
        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        let results = [];
        for(let i = 0; i < questions.length; i++) {
            const result = await askQuestion(rl, questions[i]);
            results.push(result);
        }
        rl.close();
        resolve(results);
    })
}

startQuestions();

function brickWork(...args) {
    // argumentsArray is a copy of the input
    // its purpose is to transform the arguments object-like array to normal array
    // and prevent loosing or transforming the initial input values
    let argumentsArray = [...args];

    // n, m are extracted using array destructoring
    // after turning the string to array via split method
    let n = Number(argumentsArray[0]);
    let m = Number(argumentsArray[1]);

    // Validations for input
    if (n <= 1 || n % 2 !== 0 || n > 100 || m <= 1 || m % 2 !== 0 || m > 100 ) {
        return console.log(-1);
    }
    if ( argumentsArray.length !== 3) {
        return console.log(-1);
    }
    
    // object containing other objects representing layers
    const layers = createLayersObjects(2);

    // avalibleBricks is an array holding avalible bricks
    const avalibleBricks = createAvalibleBricksArray(n, m);

    // creates the layersObjects
    // and auguments them with lines of half-bricks
    function createLayersObjects(numLayers) {
        let layers = {}
        for (let i = 1; i <= numLayers; i++) {
          layers[stringifyNumber(i) + 'Layer'] = {};
        }

        // this for loop auguments firstLayer with lines of halaf-bricks
        // and auguments secondLayer with empty arrays to be filled
        console.log(argumentsArray[2]);
        for (let i = 1; i <= n; i++) {
            layers.firstLayer["line" + i] = argumentsArray[2][i - 1].split(" ");
            layers.secondLayer["line" + i] = [];
        }

        // here we freeze the firstLayer to prevent
        // any unwanted mutations (bricks are already laid)
        Object.freeze(layers.firstLayer);
        
        return layers;
    }
    

    // applySecondLayer is the function which iterates 
    // ovrer the firstLayer lines and half-bricks and
    // determine the position of bricks for secondLayer
    function applySecondLayer() {
        for (let i = 1; i <= n; i += 2) {
            for (let j = 0; j < m; j++) {

                // currHalfBrick represents the half-brick which
                // we are currently standing at
                let currHalfBrick = layers.firstLayer["line" + i][j];

                // nextHalfBrick represents the half-brick which
                // stands one iteration ahead
                let nextHalfBrick = layers.firstLayer["line" + i][j + 1];

                // here we check if nextHalfBrick doesnt exist
                // if so we close the secondLayer with vertical brick
                // and we break the loop so we can moove to next layers
                if (!nextHalfBrick) {
                    layers.secondLayer["line" + i][j] = avalibleBricks[0] + "*";
                    layers.secondLayer["line" + (i + 1)][j] = avalibleBricks[0] + "*";
                    break;
                }

                // here we check if two half-bricks are equal to determine
                // if the brick is horizontal so we know we must place a vertical
                // brick on secondLayer
                if (currHalfBrick === nextHalfBrick ) {
                    // here we check if its first brick so we can add
                    // asterisk symbol at the start of the string
                    if (j === 0) {
                        layers.secondLayer["line" + i][j] = "*" + avalibleBricks[0] + "*";
                        layers.secondLayer["line" + (i + 1)][j] = "*" + avalibleBricks[0] + "*";

                        // every time we use .shift() method we remove the first avlible brick
                        // so we can't make the mistake of placing the same brick two times
                        // which  will cause application to fail
                        avalibleBricks.shift();

                    // if not we add asterisk only at the end of string
                    } else {
                        layers.secondLayer["line" + i][j] = avalibleBricks[0] + "*";
                        layers.secondLayer["line" + (i + 1)][j] = avalibleBricks[0] + "*";
                        avalibleBricks.shift();
                    }
                    
                    // then we check if the current line length is greather thant 2
                    // so we can place a horizontal brick after the vertical
                    if (layers.firstLayer["line" + i].length > 2) {
                        layers.secondLayer["line" + i][j + 1] = avalibleBricks[0];
                        layers.secondLayer["line" + i][j + 2] = avalibleBricks[0] + "*";
                        avalibleBricks.shift();
                        layers.secondLayer["line" + (i + 1)][j + 1] = avalibleBricks[0];
                        layers.secondLayer["line" + (i + 1)][j + 2] = avalibleBricks[0] + "*";
                        avalibleBricks.shift();
                        // after placing the horizontal bricks and removing the bricks we used
                        // we jump the iteration with 3 steps so we add 2 to j and up there
                        // in the loop  j++ adds the  +1 so we get to 3 indexes further
                        j += 2;
                    //if length < 2 we close with another vertical brick and we are done
                    } else {
                        layers.secondLayer["line" + i][j + 1] = avalibleBricks[0] + "*";
                        layers.secondLayer["line" + (i + 1)][j + 1] = avalibleBricks[0] + "*";
                        avalibleBricks.shift();
                    }
                // if currHalfBrick and nextHalfBrick are not equal we must
                // place a horizontal brick over them in second layer
                } else {
                    // we check if its first brick so we can add asterisk on both sides
                    if (j === 0) {
                        layers.secondLayer["line" + i][j] = "*" + avalibleBricks[0];
                        layers.secondLayer["line" + i][j + 1] = avalibleBricks[0] + "*";
                        avalibleBricks.shift();
                        layers.secondLayer["line" + (i + 1)][j] = "*" + avalibleBricks[0];
                        layers.secondLayer["line" + (i + 1)][j + 1] = avalibleBricks[0] + "*";
                        avalibleBricks.shift();
                        j += 1;
                        // if not we add asterisk only at end
                    } else {
                        layers.secondLayer["line" + i][j] = avalibleBricks[0];
                        layers.secondLayer["line" + i][j + 1] = avalibleBricks[0] + "*";
                        avalibleBricks.shift();
                        layers.secondLayer["line" + (i + 1)][j] = avalibleBricks[0];
                        layers.secondLayer["line" + (i + 1)][j + 1] = avalibleBricks[0] + "*";
                        avalibleBricks.shift();
                        j += 1;
                    }
                    
                }
            }
        }
    }

    
    // first we call applySecondLayer function 
    applySecondLayer();
    // then we call printSecondLayer function
    Object.freeze(layers.secondLayer);
    printSecondLayer(layers.secondLayer, n);

}

function createAvalibleBricksArray(n, m) {
    let avalibleBricks = []; 
    let totalBricks = n * m / 2;
    for (let i = 1; i <= totalBricks; i++) {
        avalibleBricks.push(i);
    }
    return avalibleBricks;
}

function printSecondLayer(layer, n) {
    layer['line1'] = 'laince';
    let result = "";
    for (let i = 1; i <= n; i++) {
        result += layer["line" + i].join("") + "\n";
    }
    return console.log(result);
}

const stringifyNumber = function() {
    const special = ['zeroth','first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelvth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
    const deca = ['twent', 'thirt', 'fourt', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

    return function(n) {
        if (n < 20) return special[n];
        if (n % 10 === 0) return deca[Math.floor(n / 10) - 2] + 'ieth';
        return deca[Math.floor(n / 10) -2] + 'y-' + special[n % 10];
    };
        
}();

