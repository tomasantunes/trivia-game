// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const jsonfile = require('jsonfile');
var data;
const fs = require("fs");

if (!fs.existsSync('data.json')) {
  data = {questions: {}, options: {}, answers: {}};
  jsonfile.writeFileSync('data.json', data);
}
else {
  data = jsonfile.readFileSync('data.json');
}

$(document).ready(function(){  
  // event listeners
  $("#remaining-time").hide();
  $("#start").on('click', trivia.startGame);
  $("#insert-question-btn").on('click', trivia.insertQuestion);
  $("#clear-btn").on('click', trivia.clearAll);
  $(document).on('click' , '.option', trivia.guessChecker);
  
})

var trivia = {
  // trivia properties
  correct: 0,
  incorrect: 0,
  unanswered: 0,
  currentSet: 0,
  timer: 20,
  timerOn: false,
  timerId : '',
  // questions options and answers data
  questions: data.questions,
  options: data.options,
  answers: data.answers,
  // trivia methods
  // method to initialize game
  startGame: function(){
    // restarting game results
    trivia.currentSet = 0;
    trivia.correct = 0;
    trivia.incorrect = 0;
    trivia.unanswered = 0;
    clearInterval(trivia.timerId);
    
    // show game section
    $('#game').show();
    
    //  empty last results
    $('#results').html('');
    
    // show timer
    $('#timer').text(trivia.timer);
    
    // remove start button
    $('#start').hide();

    $('.insert-question-div').hide();

    $('#remaining-time').show();
    
    // ask first question
    trivia.nextQuestion();
    
  },
  // method to loop through and display questions and options 
  nextQuestion : function(){
    
    // set timer to 20 seconds each question
    trivia.timer = 10;
     $('#timer').removeClass('last-seconds');
    $('#timer').text(trivia.timer);
    
    // to prevent timer speed up
    if(!trivia.timerOn){
      trivia.timerId = setInterval(trivia.timerRunning, 1000);
    }
    
    // gets all the questions then indexes the current questions
    var questionContent = Object.values(trivia.questions)[trivia.currentSet];
    $('#question').text(questionContent);
    
    // an array of all the user options for the current question
    var questionOptions = Object.values(trivia.options)[trivia.currentSet];
    
    // creates all the trivia guess options in the html
    $.each(questionOptions, function(index, key){
      $('#options').append($('<button class="option btn btn-info btn-lg">'+key+'</button>'));
    })
    
  },
  // method to decrement counter and count unanswered if timer runs out
  timerRunning : function(){
    // if timer still has time left and there are still questions left to ask
    if(trivia.timer > -1 && trivia.currentSet < Object.keys(trivia.questions).length){
      $('#timer').text(trivia.timer);
      trivia.timer--;
        if(trivia.timer === 4){
          $('#timer').addClass('last-seconds');
        }
    }
    // the time has run out and increment unanswered, run result
    else if(trivia.timer === -1){
      trivia.unanswered++;
      trivia.result = false;
      clearInterval(trivia.timerId);
      resultId = setTimeout(trivia.guessResult, 1000);
      $('#results').html('<h3>Out of time! The answer was '+ Object.values(trivia.answers)[trivia.currentSet] +'</h3>');
    }
    // if all the questions have been shown end the game, show results
    else if(trivia.currentSet === Object.keys(trivia.questions).length){
      
      // adds results of game (correct, incorrect, unanswered) to the page
      $('#results')
        .html('<h3>Thank you for playing!</h3>'+
        '<p>Correct: '+ trivia.correct +'</p>'+
        '<p>Incorrect: '+ trivia.incorrect +'</p>'+
        '<p>Unaswered: '+ trivia.unanswered +'</p>'+
        '<p>Please play again!</p>');
      
      // hide game sction
      $('#game').hide();
      
      // show start button to begin a new game
      $('#start').show();
      $('.insert-question-div').show();
    }
    
  },
  // method to evaluate the option clicked
  guessChecker : function() {
    
    // timer ID for gameResult setTimeout
    var resultId;
    
    // the answer to the current question being asked
    console.log(trivia.answers);
    var currentAnswer = Object.values(trivia.answers)[trivia.currentSet];
    

    // if the text of the option picked matches the answer of the current question, increment correct
    if($(this).text() === currentAnswer){
      // turn button green for correct
      $(this).addClass('btn-success').removeClass('btn-info');
      
      trivia.correct++;
      clearInterval(trivia.timerId);
      resultId = setTimeout(trivia.guessResult, 1000);
      $('#results').html('<h3>Correct Answer!</h3>');
    }
    // else the user picked the wrong option, increment incorrect
    else{
      // turn button clicked red for incorrect
      $(this).addClass('btn-danger').removeClass('btn-info');
      
      trivia.incorrect++;
      clearInterval(trivia.timerId);
      resultId = setTimeout(trivia.guessResult, 1000);
      $('#results').html('<h3>Better luck next time! '+ currentAnswer +'</h3>');
    }
    
  },
  // method to remove previous question results and options
  guessResult : function() {
    
    // increment to next question set
    trivia.currentSet++;
    
    // remove the options and results
    $('.option').remove();
    $('#results h3').remove();
    
    // begin next question
    trivia.nextQuestion();

  },
  insertQuestion: function() {
  	var question = $("#question-input").val();
  	var options = $("#options-input").val().split(",").map(function(item) {
  	  return item.trim();
  	});
  	var answer = $("#answer-input").val();

  	var c = Object.keys(trivia.questions).length;

  	trivia.questions["q" + c] = question;
  	trivia.options["q" + c] = options;
  	trivia.answers["q" + c] = answer;

  	data.questions = trivia.questions;
  	data.options = trivia.options;
  	data.answers = trivia.answers;
  	jsonfile.writeFileSync('data.json', data);

  	alert("New question has been inserted.");
  	$("#question-input").val("");
  	$("#options-input").val("");
  	$("#answer-input").val("");
  },
  clearAll: function() {
    var c = confirm("Are you sure you wish to delete all questions?");
    if (c == true) {
        data = {questions: {}, options: {}, answers: {}};
        trivia.questions = data.questions;
        trivia.options = data.options;
        trivia.answers = data.answers;
        $('#question').text("");
        jsonfile.writeFileSync('data.json', data);
        alert("All questions have been deleted.");
    } 
  }

}