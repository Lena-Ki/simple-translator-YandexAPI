'use strict'

const API_KEY = 'trnsl.1.1.20200427T212458Z.5ca8a39f3706f3d4.ddfbdc24691a7da9ca28b71526896f5b66ab3539';

let outputBox = $('#output-box');
let translation;
let input;
let langsData;
let getLangs;
let chosenLanguage;
let inputLanguage;
let inputLanguageCode;
let outputLanguageCode;

// get languages list

$(function(){
  fetch('/langs.json')
    .then( response => { return response.json() } )
    .then( data => {
      for (let code in data["langs"]) {
        let language = data["langs"][code];
        $('#input-language-dropdown').append(`<a class="dropdown-item input-language-item" href="#">${language}</a>`)
        $('#output-language-dropdown').append(`<a class="dropdown-item output-language-item" href="#">${language}</a>`)
      }
      return langsData = data
    })
});

// choose input / output language

$('body').on('click', '.input-language-item, .output-language-item', function(e){
  e.preventDefault();

  let thisListButton = $(event.target).closest('.dropdown').find('button')

  chosenLanguage = e.target.text
  thisListButton.html(chosenLanguage)

  if (thisListButton[0].id == 'input-language-button' ) inputLanguageCode = getLanguageCode(langsData, chosenLanguage)
  else if (thisListButton[0].id == 'output-language-button' ) outputLanguageCode = getLanguageCode(langsData, chosenLanguage)
  else return null

});

// get and set translation

$('#button--translate').click(function(){
  let url = getRequestURL();

  if (inputLanguageCode == outputLanguageCode
      || inputLanguageCode == undefined
      || outputLanguageCode == undefined
    ) messageAndReset()

  $.get( url, function(data) {
    translation = data.text;
    let errorMessage = `translation not found`

    if (translation[0].length < 1) {
      outputBox.html( errorMessage )
    } else if ( translation == input ) messageAndReset()
    else outputBox.html( translation );

  })
  .fail(function(){
    console.log(`An error occured`)
  })
  
})

function messageAndReset(){
  outputBox.html( 'Choose languages' )
  $('#input-language-button').html('Input language')
  $('#output-language-button').html('Output language')
}

function getLanguageCode(langsData, lang) {
  for ( let key in langsData["langs"] ){
    if ( langsData["langs"][key].includes(lang) ) return key;
  }
  return null;
}

function getRequestURL(){
  let url = 'https://translate.yandex.net/api/v1.5/tr.json/translate';

  input = $('#input-box').val().trim();

  url += '?key=' + API_KEY;
  url += `&text=${input}`;
  url += `&lang=${inputLanguageCode}-${outputLanguageCode}`; // translation direction

  console.log(url)
  return url;
}

// erase choices on blur

$('#input-box').on('blur', function() {
  input = $('#input-box').val();
  if (input.trim().length < 2) {
    $('#input-box').val('')
    $('#input-language-button').html('Input language')
    $('#output-language-button').html('Output language')
  }
});