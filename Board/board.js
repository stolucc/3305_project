(function (){

    var players = []; //Where all the player info is stored
    var turn = 0; //Whose turn it is, based on their position in the players array
    var currentRoll;
    var rolledDouble = false;
    var numPlayers;

    document.addEventListener("DOMContentLoaded", init, false);

    
    var rollButton;
    /*
    //;;;Can be deleted
    var rollEven = false;
    var rollOdd = false;
    var rollDouble = false;
    var giveJailCardButton;
    var evenRollButton;
    var oddRollButton;
    var doubleRollPressed;
    //;;;//
    */
    var useJailCardButton;
    var dontUseJailCardButton;
    var payFineButton;
    var attemptDoubleButton;

    function init () {
        players.push(player(document.getElementById ("player1")));
        players.push(player(document.getElementById ("player2"))); 
        players.push(player(document.getElementById ("player3")));
        players.push(player(document.getElementById ("player4")));
        numPlayers = players.length
        $("#player1").fadeOut();
        $("#player1").fadeIn();
        rollButton = document.getElementById("temp");
        /*
        //;;;Can be deleted
        giveJailCardButton = document.getElementById("temp1");
        evenRollButton = document.getElementById("temp2");
        oddRollButton = document.getElementById("temp3");
        doubleRollButton = document.getElementById("temp4");
        //;;;//
        */
        useJailCardButton = document.getElementById("jYes");//...change HTML part as well
        dontUseJailCardButton = document.getElementById("jNo");
        payFineButton = document.getElementById("fine");
        attemptDoubleButton = document.getElementById("rd");
        rollButton.addEventListener("click", normalRoll, false);
        /*
        //;;;Can be deleted
        giveJailCardButton.addEventListener("click", giveJailCardPressed, false);
        evenRollButton.addEventListener("click", evenRollPressed, false);
        oddRollButton.addEventListener("click", oddRollPressed, false);
        doubleRollButton.addEventListener("click", doubleRollPressed, false);
        //;;;//
        */
        useJailCardButton.addEventListener("click", useJailCardClicked, false);
        dontUseJailCardButton.addEventListener("click", dontUseJailCardClicked, false);
        payFineButton.addEventListener("click", payFineClicked, false);
        attemptDoubleButton.addEventListener("click", attemptDoubleClicked, false);
    }

    async function diceFadeIn(num1, num2) {
        document.getElementById("temp").disabled = true;
        for(var x = 0; x <= 1; x += 0.1) {
            document.getElementById("dicePosition1").style.opacity = x;
            document.getElementById("dicePosition2").style.opacity = x;
            await sleep(100);
        }
    }

    async function diceFadeOut() {
        for(var i = 0.9; i >= 0; i -= 0.1) {
            document.getElementById("dicePosition1").style.opacity = i;
            document.getElementById("dicePosition2").style.opacity = i;
            await sleep(100);
        }
        document.getElementById("temp").disabled = false;
        incrementTurn();
    }

    function useJailCardClicked() {
        players[turn].jail.jailCard = false;
        document.getElementById("goojf").style.visibility = "hidden"; //...change goojf
        //Have to put jail card back and shuffle as well
        releaseFromJail();
        normalRoll();
    }

    function dontUseJailCardClicked() {
        jail();
    }

    function payFineClicked() {
        document.getElementById("goojfNo").style.visibility = "hidden";
        //Must take away from capital
        releaseFromJail();
        normalRoll();
    }

    async function attemptDoubleClicked() {
        document.getElementById("goojfNo").style.visibility = "hidden";
        var doubleAttempt = rollDice();
        if(rolledDouble) {
            currentRoll = doubleAttempt[0] + doubleAttempt[1];
            releaseFromJail();
            diceRolled();
        } else {
            await sleep(1000);
            diceFadeOut();
        }
    }

    function player(icon) {
        var player = {};
        player.id = icon;
        player.capital = 1500;
        player.name = "";
        player.position = "0000";
        player.double = false;
        player.doublesRolled = 0; //The number of doubles the player has rolled in a row
        player.assets = {};
        player.jailCard = false;
        player.jail = {
            jailTag: false,
            jailRoll: 0,
            justReleased: false //Set to true if they have just been released from jail
        };
        players.colours = {
            brown: 0,
            lightBlue: 0,
            pink: 0,
            orange: 0,
            red: 0,
            green: 0,
            blue: 0
        };
        return player;
    }

    function normalRoll() {
        var ro = rollDice(); //Temporary variable to get the two dice rolls
        currentRoll = ro[0] + ro[1];
        diceRolled();
    }

    /*
    //;;;
    function giveJailCardPressed() {
        for(var i = 0; i < 4; i++) {
            players[i].jailCard = true;
        }
    }

    function evenRollPressed() {
        rollEven = true;
        var even = rollDice();
        currentRoll = even[0] + even[1];
        diceRolled();
    }

    function oddRollPressed() {
        rollOdd = true;
        var odd = rollDice();
        currentRoll = odd[0] + odd[1];
        diceRolled();
    }

    function doubleRollPressed() {
        rollDouble = true;
        var doub = rollDice();
        currentRoll = doub[0] + doub[1];
        diceRolled();
    }
    */

    async function diceRolled() {
        if(players[turn].jail.justReleased) {
            players[turn].jail.justReleased = false;
        }
        //Check for doubles
        if(rolledDouble) {
            players[turn].doublesRolled++
        } else {
            //They didn't roll a double so they don't get to roll again
            players[turn].doublesRolled = 0;
        }
            
        //Move the player
        if(players[turn].doublesRolled == 3) {
            placeInJail();
            await sleep(1000);
            diceFadeOut();
        } else {
            movePlayer(players[turn].id, currentRoll, turn);
        }
    }

    function incrementTurn() {
        //Only increment if the player didn't roll a double
        if(!rolledDouble) {
            if(turn == numPlayers - 1) {
                turn = 0;
            } else {
                turn++;
            }
        }
        
        //Check if player is in jail here so that if the player is in jail the prompt for either
        //using their jailCard if they have one or to pay fine or roll for a double is automatically
        //shown without them having to click anything
        if(players[turn].jail.jailTag) {
            checkForJailCard();
        }
    }

    //The async keyword has to be used when the await() function is used
    async function movePlayer(playr, spacesToMove, turn) {
        //Gets first two numbers in the id
        var left = parseInt(players[turn].position.substring(0, 2));
        //Gets the last two numbers in the id
        var right = parseInt(players[turn].position.substring(2, 4));
        var newPosition; //The position they finish on
        //Deciding how the player's icon should move based on their position on the board
        while(spacesToMove > 0) {
            if(left == 0 && right < 10) {
                right++;
            } else if(right == 10 && left < 10) {
                left++;
            } else if(left == 10 && right > 0) {
                right--;
            } else if(right == 0 && left > 0) {
                left--;
            }
            //Getting the player's new position back into the "xxxx" format
            newPosition = positionHack(left, right);
            spacesToMove--;
            //Placing the player's icon on the new tile
            document.getElementById(newPosition).appendChild(playr);
            //Waiting for half a second so it looks nicer
            await sleep(500);
        }

        //Updating player's position
        players[turn].position = newPosition;
        //Checking for what tile they land on, currently only says "This tile is x, etc", Sean
        //and Dave are working on that I believe
        checkTile(newPosition);
        diceFadeOut();
    }

    function checkTile(playerPos) {
        
        /*
        * Being done by Sean/Dave
        */

        console.log("Tile is: " + playerPos + ", checking tile...");
    }

    function placeInJail() {
        //Setting all the appropriate flags for being in jail. Must reset all the vairables to
        //do with rolling a double and the player being released
        players[turn].jail.jailTag = true;
        players[turn].position = "0010";
        players[turn].doublesRolled = 0;
        players[turn].double = false;
        //players[turn].jail.released = false;
        rolledDouble = false;
        //Putting the player in the jail tile (0010)
        document.getElementById(players[turn].position).appendChild(players[turn].id);
    }

    function checkForJailCard() {
        //This is done at the start of the player's round so they don't have to press anything to 
        //trigger the GUI to pop up
        if(players[turn].jailCard) {
            //If they do have a jailCard they will be asked if they want to use it. If they do,
            //the dice will be rolled automatically and they will be released from jail. They
            //won't be able to roll again if they get a double though. To pop the GUI, the Use
            //Jail Card HTML element needs to be set to visible and the Normal Roll button needs
            //to be disabled
            document.getElementById("goojf").style.visibility = "visible";
            document.getElementById("temp").disabled = false;
        } else {
            //If they don't have a jailCard then the normal jail procedure is run
            jail();
        }
    }

    function jail() {
        //The program comes here if they player is in jail and either doesn't have a jailCard or
        //chooses not to use it
        var jailTime = 3; //How many turns they can stay in jail
        var payOut = 50;
        var diceRollInJail;

        //Have to disable the Normal Roll button, as the dice roll will be controlled by the GUI
        document.getElementById("temp").disabled = true;
        //Increment the number of turns the player has been in jail immediately (before they roll)
        players[turn].jail.jailRoll++;

        //If they have been in jail for 3 turns, they cannot attempt to roll a double and the dice
        //is rolled for them automatically
        if(players[turn].jail.jailRoll == jailTime) {
            releaseFromJail();
            //Must add logic to check if player has enough capital
            players[turn].capital -= payOut;
            diceRollInJail = rollDice();
            rolledDouble = false; //Just in case they roll a double after 3 turns
            currentRoll = diceRollInJail[0] + diceRollInJail[1];
            console.log("Player pays the toll (50)");
            diceRolled();
        } else {
            //The Pay Fine or Attempt to Roll Double GUI will pop if the player hasn't been in
            //jail for 3 turns and have the option to either pay the fine to get out straight away
            //or to attempt to roll a double and get out for free. For the GUI to pop, the Jail
            //Card GUI must be set to invisible and the Fine or Double GUI must be set to visible

            document.getElementById("goojf").style.visibility = "hidden";
            document.getElementById("goojfNo").style.visibility = "visible";
        }
    }

    function releaseFromJail() {
        //This sets all the appropriate variables to what they should be if the player is released
        //from jail for whatever reason. rolledDouble must be set to false so they don't get to
        //roll again if they were released for rolling a double
        var reset = 0;

        players[turn].jail.jailTag = false;
        players[turn].jail.jailRoll = reset;
        players[turn].jail.justReleased = true;
        rolledDouble = false;
    }

    function positionHack(left, right) {
        //This is just the way to get the player's new position back to the "xxxx" format
        var leftFixed;
        var rightFixed;

        if(left < 10) {
            //If the player's position is less than 10 (the highest it can be), then you need to
            //convert it to a string and concatenate it to "0"
            leftFixed = "0".concat(left.toString());
        } else {
            //If it is not less than 10, then it has to be 10 as that is the highest number it can
            //be, so you simplyneed to convert that to a string
            leftFixed = left.toString();
        }

        if(right < 10) {
            //The same logic for converting the left part of the position
            rightFixed = "0".concat(right.toString());
        } else {
            rightFixed = right.toString();
        }

        //Then you just concatenate the right side onto the left side and return it
        return leftFixed.concat(rightFixed);
    }

    function sleep(ms) {
        //This is the way you make a JS program sleep
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function rollDice() {
        //This simulates the the two dice rolling, return two separate rolls in a list
        var num1 = Math.floor(Math.random() * 6) + 1;
        var num2 = Math.floor(Math.random() * 6) + 1;

        /*
        if(rollEven) {
            var h1 = [1, 3, 1, 2, 4, 5, 2, 3, 4];
            var h2 = [3, 1, 5, 4, 2, 1, 6, 5, 6];
            var t = Math.floor(Math.random() * 9);
            num1 = h1[t];
            num2 = h2[t];
            rollEven = false;
        } else if(rollOdd) {
            var a1 = [1, 2, 1, 2, 3, 4, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 5, 6];
            var a2 = [2, 1, 4, 3, 2, 1, 6, 5, 4, 3, 2, 1, 6, 5, 4, 3, 6, 5];
            var s = Math.floor(Math.random() * 18);
            num1 = a1[s];
            num2 = a2[s];
            rollOdd = false;
        } else if(rollDouble) {
            //var z1 = [2, 3, 4, 5, 6];
            //var z = Math.floor(Math.random() * 5);
            num1 = 1;//z1[z];
            num2 = 1;//z1[z];
            rollDouble = false;
        }*/

        //Checking to see if a double is rolled
        if(num1 == num2 & !players[turn].jail.justReleased) {
            rolledDouble = true;
        } else {
            rolledDouble = false;
        }

        //Placing the number that was rolled into the HTML dice
        document.getElementById("dicePosition1").innerHTML = num1;
        document.getElementById("dicePosition2").innerHTML = num2;
        diceFadeIn();

        return [num1, num2];
    }
})();