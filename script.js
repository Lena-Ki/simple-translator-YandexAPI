'use strict'

const API_KEY = 'trnsl.1.1.20200427T212458Z.5ca8a39f3706f3d4.ddfbdc24691a7da9ca28b71526896f5b66ab3539';

let outputBox = $('#output-box');
let inputValue;
let langsData;
let getLangs;
let chosenLanguage;
let inputLanguageCode;
let outputLanguageCode;

// get languages list

$(() => {
  fetch('/langs.json', {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
  })
    .then( response => response.json() )
    .then( data => {
      for (let [ , value] of Object.entries( data["langs"] )) {
        $('#input-language-dropdown').append(`<a class="dropdown-item input-language-item" href="#">${value}</a>`)
        $('#output-language-dropdown').append(`<a class="dropdown-item output-language-item" href="#">${value}</a>`)
      }
      return langsData = data["langs"]
    })
});

// choose input / output language

$('body').on('click', '.input-language-item, .output-language-item', e => {
  e.preventDefault();

  let thisListButton = $(event.target).closest('.dropdown').find('button')

  chosenLanguage = e.target.text
  thisListButton.html(chosenLanguage)

  if (thisListButton[0].id == 'input-language-button' ) inputLanguageCode = getLanguageCode(langsData, chosenLanguage)
  else if (thisListButton[0].id == 'output-language-button' ) outputLanguageCode = getLanguageCode(langsData, chosenLanguage)
  else return null

});

// get and set translation

$('#button--translate').click( () => {
  let url = getRequestURL();

  if ( inputLanguageCode == outputLanguageCode
    || inputLanguageCode == undefined
    || outputLanguageCode == undefined
     ) messageAndReset()

  $.get( url )
  .done( data => {
    let {text} = data;
    let errorMessage = `translation not found`

    if (text[0].length < 1) outputBox.html(errorMessage)
    else if (text == inputValue) messageAndReset()
    else outputBox.html( text );

    return data
  })
  .fail( data => {
    let {message} = data.responseJSON;
    console.log(`An error occured: ${message}`) 
  })

})

// erase choices on blur

$('#input-box').on('blur', () => {
  inputValue = $('#input-box').val();
  if (inputValue.trim().length < 2) {
    $('#input-box').val('')
    $('#input-language-button').html('Input language')
    $('#output-language-button').html('Output language')
  }
});

function messageAndReset(){
  outputBox.html( 'Choose languages' )
  $('#input-language-button').html('Input language')
  $('#output-language-button').html('Output language')
}

function getLanguageCode(langsData, lang) {
  for ( let [key, value] of Object.entries(langsData) ) {
    if ( value == lang ) return key;
  }
  return null;
}

function getRequestURL(){
  let url = 'https://translate.yandex.net/api/v1.5/tr.json/translate';

  inputValue = $('#input-box').val().trim();

  url += '?key=' + API_KEY;
  url += `&text=${inputValue}`;
  url += `&lang=${inputLanguageCode}-${outputLanguageCode}`; // translation direction

  return url;
}