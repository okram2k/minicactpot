//set up a array of 9 arrays, each with numbers 0-9 This represents the possible numbers still available in each box of the cactpot. As we learn more information these numbers will be removed. The 10th array is reserved for keeping track of all avialable numbers The reset box will be able to be used to reset the boxes to their original state from a reset event.

const resetBox = [
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,9]
];
let boxes = resetBox;
//payouts array is the payout associated with the total. the index of the array is the quantity needed to get each payout such that payouts[6] would be if you had a line total of 6 your payout would be 10000 
const payouts = [0, 0, 0, 0, 0, 0, 10000, 36, 720, 360, 80, 252, 108, 72, 54, 180, 72, 180, 119, 36, 306, 1080, 144, 1800, 3600];
//lineVals will return an array with the three corresponding box ids for line. Lines are from 0 - 8: Uper left diagonal, column 1, column 2, column 3, upper right diagonal, row 1, row 2, row 3.
const lineVals = [
  [0, 4, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [2, 4, 6],
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8]
];

//number of picks left. Will be reduced by one each time a box is selected. At 0 it will lock in the cactpot calculator until it is reset
let picks = 3;



//avgMax function will return an array with the average value of all possible payouts from a line as well as the maximum payout possible in a line [avg, max]
function avgMax(line){
  const lineA = boxes[lineVals[line][0]];
  const lineB = boxes[lineVals[line][1]];
  const lineC = boxes[lineVals[line][2]];
  let totals = [];
  lineA.forEach((A) => {
    if (A != 0){
      lineB.forEach((B) =>{
        if (B != 0){
          lineC.forEach((C) => {
            if (C !=0){
              if (A != B && B != C && A != C){
                totals.push(payouts[A+B+C]);
              }
              
            }
          });
        }
      });
    }
  });
  let sum = 0;
  let max = 0;
  totals.forEach((total)=>{
    sum += total;
    if (total > max){
      max = total;
    }
  });
  let avg = sum / totals.length;
  avg = avg.toFixed(2);
  return [avg, max];
}


//pick will set the value so that the box picked will be an array with only that value and remove that value from all other arrays in the boxes array. Afterwards it will reduce the numbers of picks by 1.
function pick(boxID, value){
  let newBox = [];
  boxes.forEach((box, index) =>{
    if (index == boxID){
      box = [value];
    } else {
      box = box.filter((item) => item != value);
    }
    newBox.push(box);
  });
  boxes = newBox;
}

//Allow a user to "undo" a pick by selecting the value of "0" on a select option. Will restore that box's available picks from the 10th list and add it's value back to all arrays.
function undoPick(boxID, value){
  let newBox = [];
  let numRestore = boxes[boxID][0];
  boxes[boxID] = boxes[9];
  boxes.forEach((box, index) =>{
    if (box.length > 1){
      if (index < 9){
        box.push(numRestore);
      }
      box.sort((boxA, boxB) => boxA - boxB);
    }
    newBox.push(box);
    
  });
  boxes = newBox;
}

//returns a string with the avg and max output for each line
function avgMaxMaker(id){
  const avMx = avgMax(id);
  let output=`
  Avg:<br>${avMx[0]}<br>Max:<br>${avMx[1]}
  `;
  return output;
}

//returns a string with the html for a select box that includes all available numbers in that box's array
function selectMaker(boxID){
  let box=boxes[boxID]
  let output = ``;
  if (box.length > 1){
    output += `
        <select id="${boxID}">
          <option value="0"></option>
  `;
  box.forEach((val)=>{
    if (val != 0){
       output += `
          <option value="${val}">${val}</option>
    `;
    }
   
  });
  output += `
        </select>
  `;
  } else {
    output = `
        <select id="${boxID}">
          <option value="0"></option>
          <option value="${box[0]}" selected>${box[0]}</option>
        </select>
    `
  }
  return output;
}

//render will update the values of each line's avg and max value as well as match each box's list of available options to the corresponding number of available on the list.
function render(){
  const output = document.querySelectorAll(".output");
  output.forEach((out, index)=>{
    const content = avgMaxMaker(index);
    out.innerHTML = content;
  });
  const input=document.querySelectorAll(".input");
  input.forEach((inp, index)=>{
    const content = selectMaker(index);
    inp.innerHTML = content;
  });
  const pickplace = document.querySelector(".picks")
  pickplace.innerHTML = picks;
  selectHandler();
}
//listen event for each select form. If select is 0 and picks remianing is less than 3 do the undoPick function, otherwise do the pick function if picks remaining is greater than 0. Then render again.
function selectHandler(){
  let selects = document.querySelectorAll("select")
  selects.forEach((select, index) =>{
    select.addEventListener("change", (event) =>{
      const value = parseInt(event.target.value);
      if (value == 0 && picks < 3 && boxes[index].length == 1){
        undoPick(index, value);
        picks += 1;
        render();
      }
      if (value > 0 && picks > 0 && boxes[index].length > 1){
        pick(index, value);
        picks -= 1;
        render();
      }
    });
  });
}

function resetHandler(){
  resetBtn = document.querySelector("#reset")
  resetBtn.addEventListener("click", (event) =>{
    boxes = resetBox;
    picks = 3;
    render();
  });
}
//on load render and then start the select handler listening events
function main (){
render();
resetHandler();
}

main();