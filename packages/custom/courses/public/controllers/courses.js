'use strict';

angular.module('mean.courses')
  .config(['$viewPathProvider',
   function($viewPathProvider) {
    $viewPathProvider.override('system/views/index.html', 'courses/views/index.html');
   }
]);


var app =angular.module('mean.courses').controller('CoursesController', ['$scope', '$rootScope',
  '$stateParams', '$location', '$http','ngDialog', 'Global', 'Courses','nzTour',
  function($scope, $rootScope, $stateParams, $location, $http, ngDialog, Global, Courses, nzTour) {
    $scope.global = Global;

var compileChaptersFact = function(currentdata){
    var c="<div><ol>";
    angular.forEach(currentdata, function(v) {

        c= c + 
        "<li>Chapitre "+$scope.getPartById(v.part).id+" : <a role='button' ng-click='triggerClick($event)' data-path="+$scope.getPartById(v.part).route+">"+$scope.getPartById(v.part).title+"</a>  <span class='otherblue'>"+d3.round(100*v.value,1)+"%</span></li>";

     });

c=c+"</li></ol>";
return c;
}
var compilFact = function(fact,id){
/*
        fact.name = ;
        fact.description = ;
        fact.suggestion_title = ;
        fact.suggestion_content = ;
        */

        
        var part = $scope.getPartByIndex(id);
        var partid = $scope.getPartById(part.part_id);
        

       
        var tmpCurrentDataProv ={
            'all' : part.alltransitions.provenances,
            'past': part.alltransitions.provenances.filter(function(v){ return v.id <id-1 }),
            'future': part.alltransitions.provenances.filter(function(v){ return v.id >id })

        }    

        

        
        var tmpCurrentDataDest = {
            'all' : part.alltransitions.destinations,
            'past': part.alltransitions.destinations.filter(function(v){ return v.id <id }),
            'future': part.alltransitions.destinations.filter(function(v){ return v.id >id+1 })

        }
             

  switch(fact.issueCode)
  {
    case "interest":
        fact.name ="Trop peu d'intérêt";
        fact.description ="Ce chapitre suscite trop peu d’intérêt chez les lecteurs. Son taux d’intérêt est <b>"+d3.round(100 * fact.delta, 1) + " %</b> plus bas que les autres." ;
       
        

        fact.suggestion_title ="Revoir le contenu du chapitre, son titre et sa position dans le cours";
        fact.suggestion_content ="Est-ce que le titre du chapitre résume bien son contenu ? Si ce n’est pas le cas, il faudrait penser à reformuler ce titre. "+ 
        "Le cas échéant, ce chapitre peut-il être fusionné et intégré ailleurs dans le cours, voire supprimé ? "+
        "Si ce n’est pas possible, il faudrait alors penser à le reformuler. <br/>"+
        "<i>Pour plus d’information, nous vous recommandons de consulter les indicateurs spécifiques se rapportant à l’intérêt du chapitre.</i>";
        break;

     case "Actions_tx":
       fact.name = "Trop peu de visites";
        fact.description = "Ce chapitre est visité <b>"+d3.round(100 * fact.delta, 1) +" %</b> moins que les autres.";
        fact.suggestion_title ="Revoir le titre ou supprimer le chapitre" ;
        fact.suggestion_content = "Est-ce que le titre du chapitre résume bien son contenu ? "+
        "Si ce n’est pas le cas, il faudrait penser à reformuler ce titre. "+
        "Le cas échéant, est-ce que ce chapitre est réellement intéressant par rapport au cours ? "+
        "Dans l'affirmative, peut-il être fusionné avec un autre chapitre du cours ? Sinon, il faudrait peut être le supprimer et revoir le plan du cours.";
        break;

   
    case "readers_tx":    
        fact.name = "Trop peu de lecteurs";
        fact.description = "Ce chapitre est lu par <b>"+d3.round(100 * fact.delta, 1) +" %</b> moins de lecteurs que les autres.";
        fact.suggestion_title ="Revoir le titre ou supprimer le chapitre" ;
        fact.suggestion_content = "Est-ce que le titre du chapitre résume bien son contenu ? "+
        "Si ce n’est pas le cas, il faudrait penser à reformuler ce titre. "+
        "Le cas échéant, est-ce que ce chapitre est réellement intéressant par rapport au cours ? "+
        "Dans l'affirmative, peut-il être fusionné avec un autre chapitre du cours ? Sinon, il faudrait peut être le supprimer et revoir le plan du cours".
        break;

    case "rs_tx":
        fact.name = "Trop peu de séances";
        fact.description = "Ce chapitre est lû dans <b>"+d3.round(100 * fact.delta, 1) +" %</b> moins de séances de lecture que les autres.";
        fact.suggestion_title = "Revoir le titre et le contenu";
        fact.suggestion_content = "Est-ce que le titre du chapitre  résume bien son contenu ? "+
    "Si oui :  Est-ce que ce chapitre est  réellement intéressant par rapport au cours ? Si c'est le cas, peut-il"+
    "être reformulé, voire intégré ailleurs dans le cours ?  Sinon, la supprimer et revoir le plan de la partie chapitre et du cours. "+
    "Le cas échéant, il faudrait penser à le reformuler";
        break;

    case "speed":
    if(fact.issueSubCode=='max'){
        fact.name = "Lecture trop rapide";
        fact.description = "La vitesse moyenne de lecture de ce chapitre est  supérieure à celle des autres de <b>"+d3.round(100 * fact.delta, 1) +" mots par minutes</b>";
        fact.suggestion_title = "Réviser ou supprimer le chapitre";
        fact.suggestion_content = "Est-ce que ce chapitre comporte des éléments nouveaux, intéressants ? "+ 
        "Si ce n’est pas le cas, il faudrait peut être penser à le supprimer ou à l’intégrer dans un autre endroit du cours pour ensuite revoir le plan de ce dernier. "+
        "Le cas échéant, il faudrait penser à le réécrire:"+
        "<ul><li>enrichir le cours avec d’autres éléments à même de rehausser la qualité du chapitre</li>"+
        "<li>étendre les éléments que vous jugez intéressant</li>"
        "<li>approfondir la présentation de ces éléments</li></ul>"
        ; 
    }
    else{
        fact.name = "Lecture trop lente";
        fact.description = "La vitesse moyenne de lecture de ce chapitre est inférieure à celle des autres de <b>"+d3.round(100 * fact.delta, 1) +" mots par minutes</b>";
        fact.suggestion_title = "Réviser le chapitre";
        fact.suggestion_content = "Ce chapitre contient probablement beaucoup de notions complexes ou nouvelles. "+
        "Le chapitre doit être plus simple à lire, à comprendre. Pouvez-vous le réécrire en :"+
        "<ul><li>le simplifiant par exemple en utilisant un vocabulaire plus commun ou directement défini dans le contenu, en évitant les dispersions en allant à l'essentiel</li>"+
        "<li>vérifiant l'enchaînement logique des propos</li>"+    
        "<li>ajoutant des exemples/analogies pour faciliter la compréhension</li>"+  
        "<li>revoyant son contenu pour une éventuelle mise à jour, d’éventuelles corrections</li></ul>"+
        "Il serait peut être également intéressant d’ajouter dans ce chapitre des références vers d’autres chapitres et des liens vers d’autres ressources pour en faciliter sa compréhension.";    
    } 
        break;   

   
    case 'rereads_tx':
        fact.name = "Trop de relectures";
        fact.description ="Ce chapitre est en moyenne relue <b>"+d3.round(100 * fact.delta, 1) +" %</b> plus que les autres" ;
        fact.suggestion_title = "Simplifier l'écriture du chapitre et vérifier l'enchainement des propos";
        fact.suggestion_content = "Ce chapitre doit être plus simple à lire, à comprendre et à mémoriser. Pouvez-vous le réécrire en :"+
        "<ul><li>le simplifiant par exemple en utilisant un vocabulaire plus commun ou directement défini dans le contenu, en évitant les dispersions en allant à l'essentiel</li>"+
        "<li>vérifiant l'enchaînement logique des propos</li>"+    
        "<li>ajoutant des exemples/analogies pour faciliter la compréhension</li>"+  
        "<li>revoyant son contenu pour une éventuelle mise à jour, d’éventuelles corrections</li></ul>"+
        "Il se peut aussi que certaines relectures proviennent de l’existence de plusieurs références vers ce chapitre. "+
        "Si d’autres chapitres y font références, est-ce que ces dernières peuvent être en partie ou non supprimées en ajoutant éventuellement un rappel des notions nécessaires ? "+
        "Est-ce que le plan du cours peut être restructuré pour en éviter certaines ? <br/>"+
        "<i>Pour plus d’information, nous vous recommandons de consulter les indicateurs spécifiques se rapportant aux types de relectures (i.e. relectures conjointes/disjointes).</i>";
        break;

    case 'rereads_seq_tx':
        fact.name = "Trop de relectures successives (i.e. dans des mêmes séances de lecture)";
        fact.description = "Il y a <b>"+ d3.round(100 * fact.delta, 1) +" %</b> plus de relectures conjointes sur ce chapitre que sur les autres. "+
        "<i>Les relectures conjointes sont des relectures effectuées au cours d’une même séance de lecture.</i>";
        fact.suggestion_title = "Simplifier l'écriture du chapitre et vérifier l'enchaînement des propos";
        fact.suggestion_content ="Le chapitre doit être plus simple à lire, à comprendre. Pouvez-vous le réécrire en :"+
        "<ul><li>le simplifiant par exemple en utilisant un vocabulaire plus commun ou directement défini dans le contenu, en évitant les dispersions en allant à l'essentiel</li>"+
        "<li>vérifiant l'enchaînement logique des propos</li>"+    
        "<li>ajoutant des exemples/analogies pour faciliter la compréhension</li>"+  
        "<li>revoyant son contenu pour une éventuelle mise à jour, d’éventuelles corrections</li></ul>"+
        "Il serait peut être également intéressant d’ajouter dans ce chapitre des références vers d’autres chapitres et des liens vers d’autres ressources pour en faciliter sa compréhension."; 
        break;

    case 'rereads_dec_tx':
        fact.name = "Trop de relectures distantes (i.e. dans des séances de lecture distinctes)";
        fact.description = "Il y a <b>"+ d3.round(100 * fact.delta, 1) +" %</b> plus de relectures disjointes sur ce chapitre que sur les autres. "+
        "<i>Les relectures disjointes sont des relectures effectuées dans des séances de lecture distinctes.</i>";
        fact.suggestion_title = "Simplifier l'écriture du chapitre et vérifier l'enchaînement des propos";
        fact.suggestion_content = "Ce chapitre est probablement difficile à mémoriser ou contient des éléments qui sont des prérequis à la lecture d’autre(s) chapitre(s). "+
        "Le cas échéant, n’y a t-il pas une restructuration du cours, du chapitre et de la partie le contenant pour éviter ce phénomène ? "+
        "Par exemple, en déplaçant le chapitre à un endroit plus approprié dans le plan ?  <br/>"+
        "ll se peut aussi que certaines relectures proviennent de l’existence de plusieurs références vers ce chapitre. "+
        "Si d’autres chapitres y font références, est-ce que ces dernières peuvent être en partie ou non supprimées en ajoutant éventuellement un rappel des notions nécessaires ? "+
        "Est-ce que le plan du cours peut être restructuré pour en éviter certaines ?";
        break;

    case 'reading_not_linear':
        fact.name = "Trop de navigation non linéaires vers/depuis ce chapitre";
        fact.description = "<b>"+ fact.error_value +" %</b> des chapitres lus juste avant/après ne sont pas ceux prévus dans le plan du cours (ce ne sont pas les voisins directs).";
        fact.suggestion_title ="Revoir le contenu et la position du chapitre dans le plan du cours" ;
        fact.suggestion_content = "Ce phénomène peut survenir quand le chapitre est mal positionné dans la structure du cours. "+
        "Il se peut aussi que ce chapitre soit un prérequis pour d’autres chapitres et/ou que d’autres chapitres soient des prérequis à ce dernier.<br/>"+
        "<i>Pour plus d’information, nous vous recommandons de consulter les indicateurs spécifiques se rapportant aux reprises de la lecture</i>";
        
    
        break;

     case 'provenance_not_linear':
        fact.name = "Trop d\'arrivées non linéaires sur ce chapitre";
        fact.description = "Dans <b>"+fact.error_value+" %</b> des cas,  le chapitre lu avant celui-ci n'est pas le chapitre qui le précède directement dans le plan du cours. Les chapitres les plus souvent lus avant ce chapitres sont dans l'ordre :"+
        compileChaptersFact(tmpCurrentDataProv.all.slice(0,3));
        
        fact.suggestion_title = "Revoir le contenu et la position du chapitre dans le plan du cours";
        fact.suggestion_content ="Il se peut que ce chapitre soit un prérequis important pour plusieurs autres chapitres distants. "+
        "Le cas échéant, est-ce que le cours peut être restructuré (déplacer ce chapitre, ramener d’autres chapitres dans le voisinage directs de ce chapitre) ? <br/>"+
        "Il se peut aussi qu’il existe plusieurs références dans des chapitres non voisins vers ce chapitre, et/ou ce chapitre contienne des références vers des chapitres non voisins. <br/>" +
        "Dans tous les cas, il peut être intéressant d’inclure des rappels.<br/>"+
        "<i>Pour plus d’information, nous vous recommandons de consulter les indicateurs spécifiques se rapportant aux reprises de la lecture.</i>";
        break;

    case 'provenance_past':
        fact.name = "Trop d\'arrivées non linéaires depuis des chapitres plus en arrière";
        fact.description = "Dans <b>"+ fact.error_value +" %</b> des cas, le chapitre lu avant celui-ci se situe en amont du chapitre précédent dans le plan du cours.  Les chapitres plus en arrière les plus souvent lus avant ce chapitres sont dans l'ordre :"+
        compileChaptersFact(tmpCurrentDataProv.past.slice(0,3));
        fact.suggestion_title = "Revoir le contenu et la position du chapitre dans le plan du cours";
        fact.suggestion_content = "Ce phénomène peut survenir quand le chapitre est mal positionné dans la structure du cours. "+
        "Il est probablement référencé par des chapitres plus en amont parce que contenant des éléments qui aident la compréhension de ces derniers. "+
        "Le cas échéant, est-ce que le cours peut être restructuré (déplacer ce chapitre, ramener d’autres chapitres dans le voisinage directs de ce chapitre) ? <br/>" +
         "Il se peut aussi qu’il existe plusieurs références dans des chapitres vers ce chapitre. Dans le cas échéant, il faudrait penser à en supprimer certaines.";
        break;

    case 'provenance_future':
        fact.name = "Trop d\'arrivées non linéaires depuis des chapitres plus en avant";
        fact.description = "Dans <b>"+ fact.error_value +" %</b> des cas, le chapitre lu avant celui-ci  est un chapitre situé en aval dans le plan du cours.  Les chapitres plus en avant les plus souvent lus avant ce chapitres sont dans l'ordre :"+
        compileChaptersFact(tmpCurrentDataProv.future.slice(0,3));
        fact.suggestion_title = "Revoir le contenu et la position du chapitre dans le plan du cours";
        fact.suggestion_content = "Il se peut que ce chapitre soit un prérequis important pour plusieurs autres chapitres distants. "+
        "Le cas échéant, est-ce que le cours peut être restructuré (déplacer ce chapitre, ramener d’autres chapitres dans le voisinage directs de ce chapitre) ? "+
        "Si ce n’est pas possible, il faudrait améliorer la compréhension du chapitre en le simplifiant et en expliquant au mieux ses concepts.<br/>"+
        "Il se peut aussi qu’il existe plusieurs références dans des chapitres vers ce chapitre. Dans le cas échéant, il faudrait penser à en supprimer certaines.<br/>"+
        "Dans tous les cas, il peut être intéressant d’inclure des rappels.";
        break;

    case 'destination_not_linear':
        fact.name = "Trop de sauts vers des chapitres lointains";
        fact.description ="Dans <b>"+ fact.error_value +" %</b> des cas,  le chapitre lu après ce chapitre n'est pas celui qui le suit dans le plan du cours.  Les chapitres les plus souvent lus après ce chapitres sont dans l'ordre :"+
        compileChaptersFact(tmpCurrentDataDest.all.slice(0,3));        
        fact.suggestion_title ="Revoir le contenu et la position du chapitre dans le plan du cours" ;
        fact.suggestion_content = "Ce phénomène peut survenir quand la compréhension de ce chapitre requiert des informations situées sur des chapitres lointains. "+
        "Le cas échéant, est-ce que le cours peut être restructuré (déplacer ce chapitre, ramener d’autres chapitres dans le voisinage directs de ce chapitre) ? "+
        "Si ce chapitre contient plusieurs références vers des chapitres distants, est-ce que ces dernières peuvent être en partie ou non supprimées en ajoutant éventuellement un rappel des notions nécessaires.<br/>"+
        "Pour plus d’information, nous vous recommandons de consulter les indicateurs spécifiques se rapportant aux reprises de la lecture.";
        break;

    case 'destination_past':
        fact.name = "Trop de sauts vers des chapitres en amont";
        fact.description = "Dans <b>"+ fact.error_value +" %</b> des cas, le chapitre lu après ce chapitre se situe avant celui-ci dans le plan du cours. Les chapitres plus en arrière les plus souvent lus après ce chapitres sont dans l'ordre:"+
        compileChaptersFact(tmpCurrentDataDest.past.slice(0,3));        
        fact.suggestion_title = "Revoir le contenu et la position du chapitre dans le plan du cours";
        fact.suggestion_content = "Il est probable que ce chapitre fasse appel à des notions vues auparavant mal/non assimilées. Le cas échéant, pouvez-vous réécrire les chapitres contenant ces notions en :"+
        "<ul><li>le simplifiant par exemple en utilisant un vocabulaire plus commun ou directement défini dans le contenu, en évitant les dispersions en allant à l'essentiel</li>"+
        "<li>vérifiant l'enchaînement logique des propos</li>"+    
        "<li>ajoutant des exemples/analogies pour faciliter la compréhension</li>"+  
        "<li>revoyant son contenu pour une éventuelle mise à jour, d’éventuelles corrections</li></ul>"+
        "Il se peut aussi qu’il existe plusieurs références dans des chapitres vers ce chapitre. Dans le cas échéant, il faudrait penser à en supprimer certaines."+
        "Dans tous les cas, il peut être intéressant d’inclure des rappels.";
        break;

    case 'destination_future':

        fact.name ="Trop de sauts vers des chapitres lointains plus en aval " ;
        fact.description ="Dans <b>"+fact.error_value+" %</b> des cas, le chapitre lu après ce chapitre n'est pas celui qui le suit dans la plan du cours mais se situe plus aval. Les chapitres plus en avant les plus souvent lus après ce chapitres sont dans l'ordre:" +
        compileChaptersFact(tmpCurrentDataDest.future.slice(0,3));
        fact.suggestion_title = "Revoir le contenu et la position du chapitre dans le plan du cours";
        fact.suggestion_content = "Il est probable que les chapitres suivants ne soient pas très intéressants. Est-ce que les titres de ces chapitres résument bien leur contenu ? "+
        "Si ce n’est pas le cas, il faudrait penser à reformuler ces titres.<br/>"+
        "Est-ce que ces chapitres sont réellement intéressants par rapport au cours ? Le cas échéant, il faudrait reconsidérer le plan du cours en déplaçant ces chapitres vers un endroit plus approprié. Sinon, peuvent-il être fusionnés avec d’autres chapitres du cours voire supprimés ?<br>"+
        "Si ce chapitre contient plusieurs références vers des chapitres distants, est-ce que ces dernières peuvent être en partie ou non supprimées.";
        break;

    case 'rupture_tx':
        fact.name = "Trop de séances de lecture se terminent sur ce chapitre";
        fact.description ="<b>"+fact.error_value+" %</b> des séances de lecture se terminent sur ce chapitre.";
        fact.suggestion_title = "Réécrire et simplifier ce chapitre";
        fact.suggestion_content = "Si ce chapitre ne correspond pas au dernier d’une partie, il est probable que celui-ci soit difficile à comprendre."+ 
        "Le cas échéant, ce chapitre doit être plus simple à lire, à comprendre. Pouvez-vous le réécrire en :"+
        "<ul><li>le simplifiant par exemple en utilisant un vocabulaire plus commun ou directement défini dans le contenu, en évitant les dispersions en allant à l'essentiel</li>"+
        "<li>vérifiant l'enchaînement logique des propos</li>"+    
        "<li>ajoutant des exemples/analogies pour faciliter la compréhension</li>"+  
        "<li>revoyant son contenu pour une éventuelle mise à jour, d’éventuelles corrections</li></ul>"+
        "Il serait peut être également intéressant d’ajouter dans ce chapitre des références vers d’autres chapitres et des liens vers d’autres ressources pour en faciliter sa compréhension.<br/>"+
        "<i>Pour plus d’information, nous vous recommandons de consulter les indicateurs spécifiques se rapportant aux arrêts de la lecture sur ce chapitre.</i>";
        break;

    case 'norecovery_tx':
        fact.name = "Trop d\'arrêts définitifs de la lecture sur ce chapitre";
        fact.description ="<b>"+fact.error_value+ " %</b> des arrêts définitifs de la lecture du cours  se passent sur ce chapitre.";
        fact.suggestion_title = "Réécrire et simplifier ce chapitre";
        fact.suggestion_content = "Si ce chapitre ne correspond pas au dernier du cours, il est probable que celui-ci soit difficile à comprendre. "+
        "Le cas échéant, ce chapitre doit être plus simple à lire, à comprendre. Pouvez-vous le réécrire en :"+
        "<ul><li>le simplifiant par exemple en utilisant un vocabulaire plus commun ou directement défini dans le contenu, en évitant les dispersions en allant à l'essentiel</li>"+
        "<li>vérifiant l'enchaînement logique des propos</li>"+    
        "<li>ajoutant des exemples/analogies pour faciliter la compréhension</li>"+  
        "<li>revoyant son contenu pour une éventuelle mise à jour, d’éventuelles corrections</li></ul>"+
        "Il serait peut être également intéressant d’ajouter dans ce chapitre des références vers d’autres chapitres et des liens vers d’autres ressources pour en faciliter sa compréhension.";
        break;

    case 'resume_abnormal_tx':
        fact.name = "Après arrêt de la lecture sur ce chapitre, trop de reprises sur des chapitres lointains";
        fact.description ="Après arrêt sur ce chapitre, <b>"+fact.error_value+" %</b> des reprises se font sur un chapitre autre  que le chapitre en question ou celui qui le suit dans le plan du cours." ;
        fact.suggestion_title ="Revoir les chapitres voisins"
        fact.suggestion_content = "Il est probable que ce chapitre fasse appel à des notions vues auparavant mal/non assimilées. Le cas échéant, pouvez-vous réécrire les chapitres contenant ces notions. "+
        "Il est également probable que les chapitres suivants ne soient pas très intéressants. <br/>"+
        "<i>Pour plus d’information, nous vous recommandons de consulter les indicateurs spécifiques se rapportant aux reprises de la lecture.</i>";
        break;

    case 'resume_past':
        fact.name ="Après arrêt de la lecture sur ce chapitre, trop de reprises sur des chapitres en amont";
        fact.description ="Après arrêt sur ce chapitre, <b>"+fact.error_value+" %</b> des reprises se font sur des chapitres précédents."
        fact.suggestion_title = "Revoir certains chapitres situés en amont";
        fact.suggestion_content = "Il est probable que ce chapitre fasse appel à des notions vues auparavant mal/non assimilées. Le cas échéant, pouvez-vous réécrire les chapitres contenant ces notions en :"+
        "<ul><li>le simplifiant par exemple en utilisant un vocabulaire plus commun ou directement défini dans le contenu, en évitant les dispersions en allant à l'essentiel</li>"+
        "<li>vérifiant l'enchaînement logique des propos</li>"+    
        "<li>ajoutant des exemples/analogies pour faciliter la compréhension</li>"+  
        "<li>revoyant son contenu pour une éventuelle mise à jour, d’éventuelles corrections</li></ul>"+
        "<i>Pensez à consulter les indicateurs de relecture sur les chapitres de reprise, pour identifier d’éventuels problèmes de lecture.</i>";
        break; 

    case 'resume_future':
        fact.name = "Après arrêt de la lecture sur ce chapitre, trop de reprises sur des chapitres en aval";
        fact.description ="Après arrêt sur ce chapitre, <b>"+fact.error_value+" %</b> des reprises se font sur des chapitres trop en aval (au-delà du chapitre suivant prévu dans le plan du cours)."
        fact.suggestion_title = "Revoir les chapitres sautés";
        fact.suggestion_content = "Il est probable que les chapitres suivants ne soient pas très intéressants. Est-ce que les titres de ces chapitres résument bien leur contenu ? Si ce n’est pas le cas, il faudrait penser à reformuler ces titres. <br/>"+
        "Est-ce que ces chapitres sont réellement intéressants par rapport au cours ? Le cas échéant, il faudrait reconsidérer le plan du cours en déplaçant ces chapitres vers un endroit plus approprié. Sinon, peuvent-il être fusionnés avec d’autres chapitres du cours voire supprimés ?";
        break;   
}

}
var resetIndicators = function(dospeed){

    //if(dospeed)
      return [      
        {'class':'reading','code':'interest', 'value':'interest', 'label':'Intérêt', 'inspectorText':'aux visites', 
        'issueCode':'interest','category':'Indicateurs de lecture',
        'title':'L\'intérêt est un indicateur qui résume l\'attractivité du chapitre et le niveau d\'engagement des lecteurs à lire et à interagir avec  ce dernier. ',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':true,'available':true, 'show':true,'parent':null, 'level':'level0', 'details':false},
        {'class':'reading','code':'Actions_tx', 'value':'Actions_tx', 'label':'Visite', 'inspectorText':'aux visites', 
        'issueCode':'Actions_tx','category':'Indicateurs de lecture','title':'Le taux de visites enregistré sur un élément du cours (partie, chapitre, section) est calculé comme étant le percentage de visites sur le cours qui ont eu pour cible cet élément',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false,'available':true, 'show':false,'parent': 'interest', 'level':'level1', 'details':false},        
        {'class':'reading','code':'readers_tx', 'value':'readers_tx', 'label':'Lecteurs', 'inspectorText':'aux lecteurs', 
        'issueCode':'readers_tx','category':'Indicateurs de lecture','title':'Le taux de lecteurs du cours ayant visité un élément du cours (partie, chapitre, section) est calculé comme étant le percentage de visiteurs de l\'élément par rapport aux visiteurs du cours',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false,'available':true, 'show':false,'parent': 'interest', 'level':'level1', 'details':false},
        {'class':'reading','code':'rs_tx', 'value':'rs_tx', 'label':'Séances', 'inspectorText':'aux séances', 
        'issueCode':'rs_tx','category':'Indicateurs de lecture','title':'Le taux de séances de lecture contenant l\'élément sélectionné représente le pourcentage de toutes les séances du cours contenant cet élément ',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false,'available':true, 'show':false,'parent': 'interest', 'level':'level1', 'details':false},
        {'class':'reading','code':'speed', 'value':'speed', 'label':'Vitesse de lecture','inspectorText':'à la vitesse de lecture', 
        'issueCode':'speed','category':'Indicateurs de lecture','title':'La vitesse de lecture observée sur le cours ou sur un de ses éléments (partie, chapitre, section) est calculée comme étant le nombre de mots lue par minute pour les lectures observée sur le cours ou sur l\'élément en question',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false,'available':dospeed, 'show':false,'parent': 'interest', 'level':'level1', 'details':false},

        {'class':'rereading','code':'rereads_tx', 'value':'rereads_tx', 'label':'Relecture','inspectorText':'à la relecture', 
        'issueCode':'rereads_tx','category':'Indicateurs de relecture','title':'Le taux de relecture du cours ou d\'un de ses éléments (partie, chapitre, section) est calculé comme étant le taux que représentent les lectures qui sont des relectures, par rapport à l\'ensemble des lectures enregistrées sur le cours ou sur l\'élément en question',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':true,'available':true, 'show':false,'parent':null, 'show':true, 'level':'level0', 'details':false},        
        {'class':'rereading','code':'rereads_seq_tx', 'value':'rereads_seq_tx', 'label':'Relectures conjointes','inspectorText':'à la relecture conjointe',
         'issueCode':'rereads_seq_tx','category':'Indicateurs de relecture','title':'Le taux de relectures conjointes du cours ou d\'un de ses éléments (partie, chapitre, section) est calculé comme étant le taux que représentent les lectures qui sont des relectures, par rapport à l\'ensemble des lectures enregistrées sur le cours ou sur l\'élément en question',
         'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false,'available':true, 'show':false,'parent': 'rereads_tx', 'level':'level1', 'details':false},
        {'class':'rereading','code':'rereads_dec_tx', 'value':'rereads_dec_tx', 'label':'Relectures disjointes','inspectorText':'à la relecture disjointe',
         'issueCode':'rereads_dec_tx','category':'Indicateurs de relecture','title':'Le taux de relectures disjointes du cours ou d\'un de ses éléments (partie, chapitre, section) est calculé comme étant le taux que représentent les lectures qui sont des relectures, par rapport à l\'ensemble des lectures enregistrées sur le cours ou sur l\'élément en question',
         'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false,'available':true, 'show':false,'parent': 'rereads_tx', 'level':'level1', 'details':false},
   
        {'class':'navigation','code':'reading_not_linear', 'value':'reading_not_linear', 'label':'Navigation','inspectorText':'...', 
        'issueCode':'reading_not_linear','category':'Indicateurs de navigation','title':'Le taux de navigation linéaire représente le pourcentage des arrivées et des départs vers et depuis l\'élément en question suivant l\'ordre linéaire défini par l\'auteur du cours',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':true,'parent':null,'available':true, 'show':true, 'level':'level0', 'details':false},
        {'class':'navigation','code':'provenance_not_linear', 'value':'provenance_not_linear', 'label':'Provenance non linéaire','inspectorText':'...', 
        'issueCode':'provenance_not_linear','category':'Indicateurs de navigation','title':'...',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':true,'available':true, 'show':false,'parent':'reading_not_linear', 'level':'level1', 'details':false},
        {'class':'navigation','code':'provenance_past', 'value':'provenance_past', 'label':'Provenance depuis l\'arrière','inspectorText':'...', 
        'issueCode':'provenance_past','category':'Indicateurs de navigation','title':'...',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false,'available':true, 'show':false,'parent': 'provenance_not_linear', 'level':'level2', 'details':false},
        {'class':'navigation','code':'provenance_future', 'value':'provenance_future', 'label':'Provenance depuis l\'avant','inspectorText':'....', 
        'issueCode':'provenance_future','category':'Indicateurs de navigation','title':'...',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false,'available':true, 'show':false,'parent': 'provenance_not_linear', 'level':'level2', 'details':false},
        {'class':'navigation','code':'destination_not_linear', 'value':'destination_not_linear', 'label':'Destination non linéaire','inspectorText':'...', 
        'issueCode':'destination_not_linear','category':'Indicateurs de navigation','title':'...',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':true,'available':true, 'show':false,'parent':'reading_not_linear', 'level':'level1', 'details':false},
        {'class':'navigation','code':'destination_past', 'value':'destination_past', 'label':'Saut vers l\'arrière','inspectorText':'...', 
        'issueCode':'destination_past','category':'Indicateurs de navigation','title':'...',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false,'available':true, 'show':false,'parent': 'destination_not_linear', 'level':'level2', 'details':false},
        {'class':'navigation','code':'destination_future', 'value':'destination_future', 'label':'Saut vers l\'avant','inspectorText':'....', 
        'issueCode':'destination_future','category':'Indicateurs de navigation','title':'...',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false,'available':true, 'show':false,'parent': 'destination_not_linear', 'level':'level2', 'details':false},

                
        {'class':'stop','code':'rupture_tx', 'value':'rupture_tx', 'label':'Arrêts', 'inspectorText':'aux fin de séances de lectrue',
        'issueCode':'rupture_tx','category':'Indicateurs d\'arrêt et reprise','title':'Le taux des fin séances de lecture sur un élément du cours (partie, chapitre, section) est calculé comme étant le pourcentage des arrêts définitifs de la lecture ayant eu lieu sur l\'element en question par rapport à l\'ensemble des arrêts enregistrés',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':true,'available':true, 'show':true,'parent': null, 'level':'level0', 'details':false},
        {'class':'stop','code':'norecovery_tx', 'value':'norecovery_tx', 'label':'Arrêts définitifs', 'inspectorText':'aux arrêts de la lectrue',
        'issueCode':'norecovery_tx','category':'Indicateurs d\'arrêt et reprise','title':'Le taux des arrêts définitifs de la lecture sur un élément du cours (partie, chapitre, section) est calculé comme étant le pourcentage des arrêts définitifs de la lecture ayant eu lieu sur l\'element en question par rapport à l\'ensemble des arrêts enregistrés',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false,'available':true, 'show':false,'parent': 'rupture_tx', 'level':'level1', 'details':false},
        {'class':'stop','code':'resume_abnormal_tx', 'value':'resume_abnormal_tx', 'label':'Reprise', 'inspectorText':'aux fin de séances de lectrue',
        'issueCode':'resume_abnormal_tx','category':'Indicateurs d\'arrêt et reprise','title':'Le taux des fin séances de lecture sur un élément du cours (partie, chapitre, section) est calculé comme étant le pourcentage des arrêts définitifs de la lecture ayant eu lieu sur l\'element en question par rapport à l\'ensemble des arrêts enregistrés',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':true,'available':true,'parent': 'rupture_tx', 'level':'level1', 'details':false},        
        {'class':'stop','code':'resume_past', 'value':'resume_past', 'label':'Reprise en arrière', 'inspectorText':'à la reprise en arrière de la lectrue',
        'issueCode':'resume_past','category':'Indicateurs d\'arrêt et reprise','title':'Le taux des reprises après arrêt sur ce chapitre',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false,'available':true, 'show':false,'parent': 'resume_abnormal_tx', 'level':'level2', 'details':false},        
        {'class':'stop','code':'resume_future', 'value':'resume_future', 'label':'Reprise en avant', 'inspectorText':'à la reprise en avant de la lectrue',
        'issueCode':'resume_future','category':'Indicateurs d\'arrêt et reprise','title':'Le taux des reprises après arrêt sur ce chapitre',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false,'available':true, 'show':false,'parent': 'resume_abnormal_tx', 'level':'level2', 'details':false}
        
      ]
      //else
        return [      
        {'class':'reading','code':'interest', 'value':'interest', 'label':'Intérêt', 'inspectorText':'aux visites', 
        'issueCode':'interest','category':'Indicateurs de lecture',
        'title':'L\'intérêt est un indicateur qui résume l\'attractivité du chapitre et le niveau d\'engagement des lecteurs à lire et à interagir avec  ce dernier. ',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':true, 'show':true,'parent':null, 'level':'level0', 'details':false},
        {'class':'reading','code':'Actions_tx', 'value':'Actions_tx', 'label':'Visite', 'inspectorText':'aux visites', 
        'issueCode':'Actions_tx','category':'Indicateurs de lecture','title':'Le taux de visites enregistré sur un élément du cours (partie, chapitre, section) est calculé comme étant le percentage de visites sur le cours qui ont eu pour cible cet élément',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false, 'show':false,'parent': 'interest', 'level':'level1', 'details':false},        
        {'class':'reading','code':'readers_tx', 'value':'readers_tx', 'label':'Lecteurs', 'inspectorText':'aux lecteurs', 
        'issueCode':'readers_tx','category':'Indicateurs de lecture','title':'Le taux de lecteurs du cours ayant visité un élément du cours (partie, chapitre, section) est calculé comme étant le percentage de visiteurs de l\'élément par rapport aux visiteurs du cours',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false, 'show':false,'parent': 'interest', 'level':'level1', 'details':false},
        {'class':'reading','code':'rs_tx', 'value':'rs_tx', 'label':'Séances', 'inspectorText':'aux séances', 
        'issueCode':'rs_tx','category':'Indicateurs de lecture','title':'Le taux de séances de lecture contenant l\'élément sélectionné représente le pourcentage de toutes les séances du cours contenant cet élément ',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false, 'show':false,'parent': 'interest', 'level':'level1', 'details':false},
        

        {'class':'rereading','code':'rereads_tx', 'value':'rereads_tx', 'label':'Relecture','inspectorText':'à la relecture', 
        'issueCode':'rereads_tx','category':'Indicateurs de relecture','title':'Le taux de relecture du cours ou d\'un de ses éléments (partie, chapitre, section) est calculé comme étant le taux que représentent les lectures qui sont des relectures, par rapport à l\'ensemble des lectures enregistrées sur le cours ou sur l\'élément en question',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':true, 'show':false,'parent':null, 'show':true, 'level':'level0', 'details':false},        
        {'class':'rereading','code':'rereads_seq_tx', 'value':'rereads_seq_tx', 'label':'Relectures conjointes','inspectorText':'à la relecture conjointe',
         'issueCode':'rereads_seq_tx','category':'Indicateurs de relecture','title':'Le taux de relectures conjointes du cours ou d\'un de ses éléments (partie, chapitre, section) est calculé comme étant le taux que représentent les lectures qui sont des relectures, par rapport à l\'ensemble des lectures enregistrées sur le cours ou sur l\'élément en question',
         'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false, 'show':false,'parent': 'rereads_tx', 'level':'level1', 'details':false},
        {'class':'rereading','code':'rereads_dec_tx', 'value':'rereads_dec_tx', 'label':'Relectures disjointes','inspectorText':'à la relecture disjointe',
         'issueCode':'rereads_dec_tx','category':'Indicateurs de relecture','title':'Le taux de relectures disjointes du cours ou d\'un de ses éléments (partie, chapitre, section) est calculé comme étant le taux que représentent les lectures qui sont des relectures, par rapport à l\'ensemble des lectures enregistrées sur le cours ou sur l\'élément en question',
         'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false, 'show':false,'parent': 'rereads_tx', 'level':'level1', 'details':false},
   
        {'class':'navigation','code':'reading_not_linear', 'value':'reading_not_linear', 'label':'Navigation','inspectorText':'...', 
        'issueCode':'reading_not_linear','category':'Indicateurs de navigation','title':'Le taux de navigation linéaire représente le pourcentage des arrivées et des départs vers et depuis l\'élément en question suivant l\'ordre linéaire défini par l\'auteur du cours',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':true,'parent':null, 'show':true, 'level':'level0', 'details':false},
        {'class':'navigation','code':'provenance_not_linear', 'value':'provenance_not_linear', 'label':'Provenance non linéaire','inspectorText':'...', 
        'issueCode':'provenance_not_linear','category':'Indicateurs de navigation','title':'...',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':true, 'show':false,'parent':'reading_not_linear', 'level':'level1', 'details':false},
        {'class':'navigation','code':'provenance_past', 'value':'provenance_past', 'label':'Provenance depuis l\'arrière','inspectorText':'...', 
        'issueCode':'provenance_past','category':'Indicateurs de navigation','title':'...',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false, 'show':false,'parent': 'provenance_not_linear', 'level':'level2', 'details':false},
        {'class':'navigation','code':'provenance_future', 'value':'provenance_future', 'label':'Provenance depuis l\'avant','inspectorText':'....', 
        'issueCode':'provenance_future','category':'Indicateurs de navigation','title':'...',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false, 'show':false,'parent': 'provenance_not_linear', 'level':'level2', 'details':false},
        {'class':'navigation','code':'destination_not_linear', 'value':'destination_not_linear', 'label':'Destination non linéaire','inspectorText':'...', 
        'issueCode':'destination_not_linear','category':'Indicateurs de navigation','title':'...',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':true, 'show':false,'parent':'reading_not_linear', 'level':'level1', 'details':false},
        {'class':'navigation','code':'destination_past', 'value':'destination_past', 'label':'Saut vers l\'arrière','inspectorText':'...', 
        'issueCode':'destination_past','category':'Indicateurs de navigation','title':'...',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false, 'show':false,'parent': 'destination_not_linear', 'level':'level2', 'details':false},
        {'class':'navigation','code':'destination_future', 'value':'destination_future', 'label':'Saut vers l\'avant','inspectorText':'....', 
        'issueCode':'destination_future','category':'Indicateurs de navigation','title':'...',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false, 'show':false,'parent': 'destination_not_linear', 'level':'level2', 'details':false},

                
        {'class':'stop','code':'rupture_tx', 'value':'rupture_tx', 'label':'Arrêts', 'inspectorText':'aux fin de séances de lectrue',
        'issueCode':'rupture_tx','category':'Indicateurs d\'arrêt et reprise','title':'Le taux des fin séances de lecture sur un élément du cours (partie, chapitre, section) est calculé comme étant le pourcentage des arrêts définitifs de la lecture ayant eu lieu sur l\'element en question par rapport à l\'ensemble des arrêts enregistrés',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':true, 'show':true,'parent': null, 'level':'level0', 'details':false},
        {'class':'stop','code':'norecovery_tx', 'value':'norecovery_tx', 'label':'Arrêts définitifs', 'inspectorText':'aux arrêts de la lectrue',
        'issueCode':'norecovery_tx','category':'Indicateurs d\'arrêt et reprise','title':'Le taux des arrêts définitifs de la lecture sur un élément du cours (partie, chapitre, section) est calculé comme étant le pourcentage des arrêts définitifs de la lecture ayant eu lieu sur l\'element en question par rapport à l\'ensemble des arrêts enregistrés',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false, 'show':false,'parent': 'rupture_tx', 'level':'level1', 'details':false},
        {'class':'stop','code':'resume_abnormal_tx', 'value':'resume_abnormal_tx', 'label':'Reprise', 'inspectorText':'aux fin de séances de lectrue',
        'issueCode':'resume_abnormal_tx','category':'Indicateurs d\'arrêt et reprise','title':'Le taux des fin séances de lecture sur un élément du cours (partie, chapitre, section) est calculé comme étant le pourcentage des arrêts définitifs de la lecture ayant eu lieu sur l\'element en question par rapport à l\'ensemble des arrêts enregistrés',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':true,'parent': 'rupture_tx', 'level':'level1', 'details':false},        
        {'class':'stop','code':'resume_past', 'value':'resume_past', 'label':'Reprise en arrière', 'inspectorText':'à la reprise en arrière de la lectrue',
        'issueCode':'resume_past','category':'Indicateurs d\'arrêt et reprise','title':'Le taux des reprises après arrêt sur ce chapitre',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false, 'show':false,'parent': 'resume_abnormal_tx', 'level':'level2', 'details':false},        
        {'class':'stop','code':'resume_future', 'value':'resume_future', 'label':'Reprise en avant', 'inspectorText':'à la reprise en avant de la lectrue',
        'issueCode':'resume_future','category':'Indicateurs d\'arrêt et reprise','title':'Le taux des reprises après arrêt sur ce chapitre',
        'sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null,'hasChildren':false, 'show':false,'parent': 'resume_abnormal_tx', 'level':'level2', 'details':false}
        
      ]
      
}

var toggleChildren = function(parent){
  parent.details = !parent.details;
  
  

   angular.forEach($scope.indicatorsHeader, function(ch) { 
   if(ch.parent==parent.code){
      ch.show = !ch.show;
     
    
    if((!ch.show) && (ch.details)) 
     toggleChildren(ch);
   }
     
  })
}

var show_or_hideChildren = function(parent, show){
  
  
  parent.details = show;

   angular.forEach($scope.indicatorsHeader, function(ch) { 
   if(ch.parent==parent.code){
    
      ch.show = show;    

    
    if(ch.details)
     show_or_hideChildren(ch,show);
   }
     
  })


}

var getGraphTitle = function(code){
  switch(code) {
    case "interest":
        return("Taux d'intérêt estimé");
        break;
     case "Actions_tx":
        return('Taux de visites');
        break;
    case "Readers":
        return('Nombre de lecteurs distincts');
        break;
    case "readers_tx":
        return('Taux de lecteurs');
        break;
    case "rs_tx":
        return('Taux de séances de lecture');
        break;
    case "speed":
        return('Vitesse de lecture (en mots par min)');        
        break;    
    case 'mean.duration':
        return('Durée moyenne de lecture de la section(en minutes)')
        break;
    case 'rereads_tx':
        return('Taux de lectures qui sont des relectures');
        break;
    case 'rereads_seq_tx':
        return('Taux de relectures conjointes');
        break;
    case 'rereads_dec_tx':
        return('Taux de relectures disjointes');
        break;
    case 'norecovery_tx':
        return('Taux des arrêts définitifs de la lecture');
        break;
    case 'resume_abnormal_tx':
        return('Distribution des taux de reprise')
        break;
    case 'resume_past':
        return('Taux de reprises en arrière de la lecture');
        break; 
    case 'resume_future':
        return('Taux de reprises en avant de la lecture');
        break;        
    case 'rupture_tx':
        return('Taux de fin des séances de lecture');
        break;
    case 'reading_not_linear':
        return('Linéarité de la lecture');
        break;
    case 'provenance_not_linear':
        return('Provenance non linéaire');
        break;
    case 'provenance_past':
        return('Provenance depuis l\'arrière');
        break;
    case 'provenance_future':
        return('Provenance depuis l\'avant');
        break;
    case 'destination_not_linear':
        return('Destination non linéaire');
        break;
    case 'destination_past':
        return('Saut vers l\'arrière');
        break;
    case 'destination_future':
        return('Saut vers l\'avant');
        break;
}

}

var completeCourseParts = function(){ 
  var courseParts = [], courseChapters = [];
  var globalTransitions = {'provenance':{'normal':[],'past':[],'future':[]},'destination':{'normal':[],'past':[],'future':[]}}
  
  
  angular.forEach($scope.course.tomes, function(tome) {
    tome.parts_count = 0;
    tome.route = $.param({'partid':tome._id});
     tome.fullpath = {
          'part':{'id':tome._id, 'route':tome.route, 'title':tome.title},
          'chapter':null,
          'section':null
        };
    tome.url = $scope.course.url;
    
      var transitions = {'provenance':{'normal':[],'past':[],'future':[]},'destination':{'normal':[],'past':[],'future':[]}}

    angular.forEach(tome.chapters, function(chapter) { 
      chapter.parts_count = 0;
      chapter.route =$.param({'partid':tome._id, 'chapid':chapter._id});
      chapter.fullpath = {
          'part':{'id':tome._id, 'route':tome.route, 'title':tome.title},
          'chapter':{'id':chapter._id, 'route':chapter.route, 'title':chapter.title},
          'section':null
        };
        chapter.transitions={
        'provenance':{
          'normal': chapter.indicators.provenance_prev,
          'past':chapter.indicators.provenance_past,
          'future':chapter.indicators.provenance_future
        },
        'destination':{
          'normal': chapter.indicators.destination_next,
          'past':chapter.indicators.destination_past,
          'future':chapter.indicators.destination_future
        }
      };
      chapter.alltransitions = $scope.allTransitions(chapter.part_id);
      transitions.provenance.normal.push(chapter.transitions.provenance.normal);
      transitions.provenance.past.push(chapter.transitions.provenance.past);
      transitions.provenance.future.push(chapter.transitions.provenance.future);
      transitions.destination.normal.push(chapter.transitions.destination.normal);
      transitions.destination.past.push(chapter.transitions.destination.past);
      transitions.destination.future.push(chapter.transitions.destination.future);

      
    


      chapter.url = $scope.course.url+'/'+chapter.url;
      angular.forEach(chapter.facts,function(fact){ 
          compilFact(fact, chapter.id);
          fact.route = $.param({'partid':tome._id, 'chapid':chapter._id, 'factid':fact._id});
          fact.tome=tome._id;
          fact.partId=chapter.id;
          fact.partType='chapter';
          fact.partRoute=chapter.route;
          fact.chapter=chapter._id;
          fact.section=null;
          
          fact.d3 =[];
          fact.d3 ={ 'chapter':chapter.route,'tome':tome.route};

        });
      if(chapter.parts.length==0) tome.parts_count = tome.parts_count + 1;
      
      angular.forEach(chapter.parts, function(part) {
        part.parent = chapter._id;
        tome.parts_count = tome.parts_count + 1;
        if(tome.parts_count===1) tome.url = chapter.url;
        chapter.parts_count = chapter.parts_count + 1;
        part.route =$.param({'partid':tome._id, 'chapid':chapter._id,'sectionid':part._id});
        part.fullpath = {
          'part':{'id':tome._id, 'route':tome.route, 'title':tome.title},
          'chapter':{'id':chapter._id, 'route':chapter.route, 'title':chapter.title},
          'section':{'id':part._id, 'route':part.route, 'title':part.title}
        };
        part.transitions={
        'provenance':{
          'normal': part.indicators.provenance_prev,
          'past':part.indicators.provenance_past,
          'future':part.indicators.provenance_future
        },
        'destination':{
          'normal': part.indicators.destination_next,
          'past':part.indicators.destination_past,
          'future':part.indicators.destination_future
        }
      }
        part.url = chapter.url+'/'+'#/id/r-'+part.part_id;
        angular.forEach(part.facts,function(fact){
          fact.route = $.param({'partid':tome._id, 'chapid':chapter._id,'sectionid':part._id, 'factid':fact._id});          
          fact.tome=tome._id;
          fact.chapter=chapter._id;
          fact.section=part._id;
          fact.partId=part.id;
          fact.partType='part';
          fact.partRoute=part.route;
          fact.d3 ={'part':part.route, 'chapter':chapter.route,'tome':tome.route};

        });
        part.metrics = [];
        courseParts.push( part );
      });
      chapter.metrics = [];
      courseChapters.push( chapter ); 
    });
    tome.transitions={
        'provenance':{
          'normal': d3.round(d3.mean(transitions.provenance.normal),4),
          'past':d3.round(d3.mean(transitions.provenance.past),4),
          'future':d3.round(d3.mean(transitions.provenance.future),4)
        },
        'destination':{
          'normal': d3.round(d3.mean(transitions.destination.normal),4),
          'past':d3.round(d3.mean(transitions.destination.past),4),
          'future':d3.round(d3.mean(transitions.destination.future),4)
        }
      };

      
      globalTransitions.provenance.normal.push(tome.transitions.provenance.normal);
      globalTransitions.provenance.past.push(tome.transitions.provenance.past);
      globalTransitions.provenance.future.push(tome.transitions.provenance.future);
      globalTransitions.destination.normal.push(tome.transitions.destination.normal);
      globalTransitions.destination.past.push(tome.transitions.destination.past);
      globalTransitions.destination.future.push(tome.transitions.destination.future);

  });
      $scope.course.transitions={
        'provenance':{
          'normal': d3.round(d3.mean(globalTransitions.provenance.normal),4),
          'past':d3.round(d3.mean(globalTransitions.provenance.past),4),
          'future':d3.round(d3.mean(globalTransitions.provenance.future),4),
          'not_linear':d3.round(1- d3.mean(globalTransitions.provenance.normal),4)
        },
        'destination':{
          'normal': d3.round(d3.mean(globalTransitions.destination.normal),4),
          'past':d3.round(d3.mean(globalTransitions.destination.past),4),
          'future':d3.round(d3.mean(globalTransitions.destination.future),4),
          'not_linear':d3.round(1- d3.mean(globalTransitions.destination.normal),4)
        }
      };

  $scope.courseParts = courseParts;
  $scope.courseChapters = courseChapters; 
  
  computeColours();

  updateMainFacts();



  $scope.ChaptersFacts = $scope.MainChaptersFacts;
  $scope.SectionsFacts = $scope.MainSectionsFacts;
  

}
var dropFactLocally = function(route){

  var result = ""
  var components = parseURL(route)
  if(components.hasOwnProperty('partid')) {
    var tome = $.grep($scope.course.tomes, function(e){ return  e._id == components.partid })[0];
     if(components.hasOwnProperty('chapid')){
      var chap = $.grep(tome.chapters, function(e){ return  e._id == components.chapid })[0];
      
     if(components.hasOwnProperty('sectionid')){
        var part = $.grep(chap.parts, function(e){ return  e._id == components.sectionid })[0];
       if(components.hasOwnProperty('factid')){        
        var fact = $.grep(part.facts, function(e){ return  e._id == components.factid })[0];          
         part.facts.splice(part.facts.indexOf(fact),1);
         // $scope.inspectorFacts.Facts.splice($scope.inspectorFacts.Facts.indexOf(fact),1);
          result = part.route;
       }
      }
      else
        if(components.hasOwnProperty('factid')){
          var fact = $.grep(chap.facts, function(e){ return  e._id == components.factid })[0];          
          chap.facts.splice(chap.facts.indexOf(fact),1);
        //  $scope.inspectorFacts.Facts.splice($scope.inspectorFacts.Facts.indexOf(fact),1);
          result = chap.route;
          

        }
    }  
  }   
  
  return result;

}


  


  /**********************D3 CHARTS****************************/
var ComputeGlobalVisuData = function(){ 
  return [   {type:'interest',data:factChart('interest')},  
   {type:'Actions_tx',data:factChart('Actions_tx')},  
   {type:'readers_tx',data:factChart('readers_tx')},  
   {type:'rs_tx',data:factChart('rs_tx')},  
   {type:'rupture_tx',data:factChart('rupture_tx')},
   {type:'norecovery_tx',data:factChart('norecovery_tx')},
   {type:'resume_abnormal_tx',data:factChart('resume_abnormal_tx')},
   {type:'resume_past',data:factChart('resume_past')},   
   {type:'resume_future',data:factChart('resume_future')},   
   {type:'speed',data:factChart('speed')},  
   {type:'rereads_tx',data:factChart('rereads_tx')},  
   {type:'rereads_seq_tx',data:factChart('rereads_seq_tx')},  
   {type:'rereads_dec_tx',data:factChart('rereads_dec_tx')},  
   {type:'reading_not_linear',data:factChart('reading_not_linear')},  
   {type:'provenance_not_linear',data:factChart('provenance_not_linear')},  
   {type:'provenance_past',data:factChart('provenance_past')},  
   {type:'provenance_future',data:factChart('provenance_future')},  
   {type:'destination_not_linear',data:factChart('destination_not_linear')},
   {type:'destination_past',data:factChart('destination_past')},
   {type:'destination_future',data:factChart('destination_future')}
  ]
}




var mean = function(numbers) {
    var total = 0,
        i;
    for (i = 0; i < numbers.length; i += 1) {
        total += numbers[i];
    }
    return total / numbers.length;
}
var median = function(numbers) {
    // median of [3, 5, 4, 4, 1, 1, 2, 3] = 3
    var median = 0,
        numsLen = numbers.length;
    numbers.sort();
    if (numsLen % 2 === 0) { // is even
        // average of two middle numbers
        median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
    } else { // is odd
        // middle number only
        median = numbers[(numsLen - 1) / 2];
    }
    return median;
}

var factChart = function(issueCode){
  if(typeof $scope.course =='undefined') return;
    
    var chartData =[];
    var meanData =[];
    var dataEntries =[];
    var colorsEntries =[];
   
   var cpt = 0;

chartData.push({'part':0,
            'title':$scope.course.title,
             'elementType':'course',
            'route':$scope.course.route,
            'transitions':$scope.course.transitions,
            'indicators':$scope.course.indicators,
            'value': $scope.course[issueCode],
            'color':'grey'
          })

   angular.forEach($scope.course.tomes, function(tome){
    chartData.push({'part':tome.id,
            'title':tome.title,
             'elementType':'tome',
            'route':tome.route,
            'transitions':tome.transitions,
            'indicators':tome.indicators,
            'value': tome[issueCode],
            'color':'#45348A'
          })
          angular.forEach(tome.chapters, function(chapter){
            chartData.push({'part':chapter.id,
            'title':chapter.title,
             'elementType':'chapter',
            'route':chapter.route,
            'value': chapter.indicators[issueCode],
            'color':'#45348A',
            'indicators':chapter.indicators,
            'transitions':chapter.transitions
          })
        angular.forEach(chapter.parts, function(part){
          chartData.push({'part':part.id,
            'title':part.title,
             'elementType':'part',
            'route':part.route,
            'value': part.indicators[issueCode],
            'color':'#45348A',
            'indicators':part.indicators,
            'transitions':part.transitions
          })
        })
      })
    });
 
return chartData;

}

/************** WATCH FUNCTIONS **********************/
var tabSelectHandler = function(newValue, oldValue){ 
    var components = parseURL(window.location.hash);
    if(components!=null)  saveLog({
            'name':'selectTab',
            'elementId':components._id,
            'params':[
             {'paramName':'url','paramValue':window.location.hash}] 
          });
   if((newValue == 'facts')&($scope.inspectorFacts.Facts.length>0)){ 
      if(components == null)    
        loadURL($scope.inspectorFacts.Facts[$scope.currentFact].route)
      else
        if(!components.hasOwnProperty('factid'))
          loadURL($scope.inspectorFacts.Facts[$scope.currentFact].route);

      window.setTimeout(function() {
        resetPath();
        $(".fact[data-fact-id='"+$scope.inspectorFacts.Facts[$scope.currentFact]._id+"']").parent()
        .addClass('inspectorChosenPart').fadeIn(100).fadeOut(100).fadeIn(200).focus().select();
      }, 0); 
   }
   else{
      resetPath();  
      window.setTimeout(function() { 
        loadURL($scope.currentElement.route+'&indicator='+$scope.context.indicator);
      }, 0); 
  }
}//////////////////////////////////:

var indicatorsSelectionModelHandler = function(newValue, oldValue){ 
  if(angular.equals(newValue,oldValue)) return; 
  $scope.selectedIndicators =  $.grep($scope.indicatorsHeader, function(e){return ($.inArray(e.value, $scope.indicatorsSelectionModel)>-1)}); 
  updateMainFacts();
 if($scope.sectionDisplay){
    if($scope.allFactsDisplay){
      $scope.SectionsFacts = $scope.AllSectionsFacts;
    }
      else{
        $scope.SectionsFacts = $scope.MainSectionsFacts;
      }
    $scope.inspectorFacts.Facts = $scope.SectionsFacts;
  }
  else{
     if($scope.allFactsDisplay){
      $scope.ChaptersFacts = $scope.AllChaptersFacts;
      $scope.inspectorFacts.Facts = $scope.AllChaptersFacts;
     }
      else{
        $scope.ChaptersFacts = $scope.MainChaptersFacts;
        $scope.inspectorFacts.Facts = $scope.MainChaptersFacts;
      }

      
    
  }
} //////////////////////////////

////////////////////// FUNCTIONS
var computeAllTasks = function(){  
 var tasks =angular.copy($scope.course.todos);
 for (var i = 0; i < tasks.length; i++)   
      {
        tasks[i].selected = 'relevantTask'  
        tasks[i].route ='taskid='+tasks[i]._id+'&indicator='+tasks[i].classof
        tasks[i].minipath ='Cours'
      } 
angular.forEach($scope.course.tomes, function(tome) { 
    var tomeTasks = angular.copy(tome.todos);
    for (var i = 0; i < tomeTasks.length; i++){
    tomeTasks[i].route =tome.route+'&taskid='+tomeTasks[i]._id+'&indicator='+tomeTasks[i].classof
    tomeTasks[i].minipath ='Partie :'+tome.title
    tasks.push(tomeTasks[i]);
  } 

    angular.forEach(tome.chapters, function(chapter) {  
 var chTasks = angular.copy(chapter.todos);
      for (var i = 0; i < chTasks.length; i++){
        chTasks[i].route =chapter.route+'&taskid='+chTasks[i]._id+'&indicator='+chTasks[i].classof
        chTasks[i].minipath ='Chapitre :'+chapter.title
        tasks.push(chTasks[i]);

      } 
            angular.forEach(chapter.facts, function(fact){
               var factTasks = angular.copy(fact.todos);
                    for(var i = 0; i<factTasks.length; i++){ 
                 //var txt =  $scope.indicatorsHeader.filter(function(value){ return value.value === fact.classof})[0].label;
                      
                      factTasks[i].route = fact.route+'&taskid='+factTasks[i]._id+'&indicator='+factTasks[i].classof
                       factTasks[i].minipath ='Chapitre: '+chapter .title;//+' - ' +txt; 
                      tasks.push(factTasks[i]);}
                  })
            angular.forEach(chapter.parts, function(part) {
           var partTasks = angular.copy(part.todos);
                for (var i = 0; i < partTasks.length; i++){
                  partTasks[i].route =part.route+'&taskid='+partTasks[i]._id+'&indicator='+partTasks[i].classof
                  partTasks[i].minipath ='Section: '+part.title;
                  tasks.push(partTasks[i]);
                }
                  angular.forEach(part.facts, function(fact){
               var factTasks = angular.copy(fact.todos);
                    for(var i = 0; i<factTasks.length; i++){ 
                      factTasks[i].route = fact.route+'&taskid='+factTasks[i]._id+'&indicator='+factTasks[i].classof
                       factTasks[i].minipath ='Section: '+part.title;//+' - ' +txt; 
                      tasks.push(factTasks[i]);}
                  })
                  })
                                 
            });
});

  for (var i = 0; i < tasks.length; i++)   
    {tasks[i].selected = 'relevantTask';
       }

  return tasks

}

var computeTwoBounderyValues = function(type, indicatorCode){
  var studiedFactData=[];

if(type=='chapter'){
  $scope.courseChapters.forEach(function(chapter, i) {
      var partData = parseFloat(chapter.indicators[indicatorCode]);
      studiedFactData.push(partData);
  })
}
else{
  $scope.courseChapters.forEach(function(chapter, i) {
    chapter.parts.forEach(function(part, i) {
      var partData = parseFloat(part.indicators[indicatorCode]);
      studiedFactData.push(partData);
    })
  })
}

  var median = d3.median(studiedFactData, function(d) { return parseFloat(d); }); 
  
  for(var i = 0; i<studiedFactData.length; i++){ 
    studiedFactData[i] = Math.abs(studiedFactData[i] - median);
  }
  var min = d3.min(studiedFactData, function(d) { return parseFloat(d); }); 
  var max = d3.max(studiedFactData, function(d) { return parseFloat(d); }); 
   
  return {'MinValue':min,'MedianValue':median,'MaxValue':max};
}
var computeMinBounderyValues = function(type, indicatorCode){
  var studiedFactData=[];

if(type=='chapter'){
  $scope.courseChapters.forEach(function(chapter, i) {
      var partData = parseFloat(chapter.indicators[indicatorCode]);
      studiedFactData.push(partData);
  })
}
else{
  $scope.courseChapters.forEach(function(chapter, i) {
    chapter.parts.forEach(function(part, i) {
      var partData = parseFloat(part.indicators[indicatorCode]);
      studiedFactData.push(partData);
    })
  })
}

  var median = d3.median(studiedFactData, function(d) { return parseFloat(d); }); 
  
  for(var i = 0; i<studiedFactData.length; i++){ 
    studiedFactData[i] = median - studiedFactData[i];
    if(studiedFactData[i] < 0 ) studiedFactData[i] = 0;
  }
  var min = 0; 
  var max = d3.max(studiedFactData, function(d) { return parseFloat(d); }); 
   
  return {'MinValue':min,'MedianValue':median,'MaxValue':max};
}

var computeBgColor = function(val, indicator, range){
  var scale = chroma.scale('OrRd').padding([0,0.25]).domain([range.MinValue, range.MaxValue]);
  
  return   scale(val).hex();
}




var computeBounderyValues = function(type, indicatorCode){
  var studiedFactData=[];

if(type=='chapter'){
  $scope.courseChapters.forEach(function(chapter, i) {
      var partData = parseFloat(chapter.indicators[indicatorCode]);
      studiedFactData.push(partData);
  })
}
else{
  $scope.courseChapters.forEach(function(chapter, i) {
    chapter.parts.forEach(function(part, i) {
      var partData = parseFloat(part.indicators[indicatorCode]);
      studiedFactData.push(partData);
    })
  })
}

  var median = d3.median(studiedFactData, function(d) { return parseFloat(d); }); 
  
  
  var min = d3.min(studiedFactData, function(d) { return parseFloat(d); }); 
  var max = d3.max(studiedFactData, function(d) { return parseFloat(d); }); 
   
  return {'MinValue':min,'MedianValue':median,'MaxValue':max};
}

var decideBoundariesScale = function(partType,indicatorCode){
  var boundaryValues = computeTwoBounderyValues(partType, indicatorCode);
var scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MinValue, boundaryValues.MaxValue]);
switch(indicatorCode) {
    case "interest":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MinValue]);
        break;
    case "Actions_tx":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MinValue]);
        break;
    case "readers_tx":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MinValue]);
        break;
    case "rs_tx":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MinValue]);
        break;
    case "speed":
        boundaryValues = computeTwoBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MinValue, boundaryValues.MaxValue]);
        break;
    case "rereads_tx":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
     chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
    case "norecovery_tx":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
    case "resume_abnormal_tx":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
    case "resume_past":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;  
    case "resume_future":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;        
    case "rupture_tx":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
  case "reading_not_linear":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
  case "provenance_not_linear":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
  case "provenance_past":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
  case "provenance_future":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
  case "destination_not_linear":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
  case "destination_past":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
  case "destination_future":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;        
    case "rereads_seq_tx":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale =chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
    case "rereads_dec_tx":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale =chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
}
return {'boundaryValues':boundaryValues,'scale':scale};
}
var computeIndividualIndicatorValue =  function(part,indicatorCode, boundaryValues){
  if(indicatorCode=="speed")
     return Math.abs(boundaryValues.MedianValue - parseFloat(part.indicators.speed));
   else
    return parseFloat(part.indicators[indicatorCode])      
  
}
var computeColours =  function(){ 
  angular.forEach($scope.indicatorsHeader, function(indicator){
    var indicatorClass = indicator.code;
    var chaptersData = decideBoundariesScale('chapter',indicatorClass);
    var partsData = decideBoundariesScale('part',indicatorClass);

    var chapterScale = chaptersData.scale;
    var chapterBoundaryValues = chaptersData.boundaryValues;
    var partScale = partsData.scale;
    var partBoundaryValues = partsData.boundaryValues;

    
    angular.forEach($scope.course.tomes, function(tome) {
      angular.forEach(tome.chapters, function(chapter) {
        
        var indicatorValue = computeIndividualIndicatorValue(chapter, indicatorClass, chapterBoundaryValues);
        var chapIndicator={'code':indicatorClass, 
                           'delta':indicatorValue, 
                           'color':chapterScale(indicatorValue).hex()};
        chapter.metrics.push(chapIndicator);
        
        angular.forEach(chapter.parts, function(part) {
          var indicatorValue = computeIndividualIndicatorValue(part, indicatorClass, partBoundaryValues);
         var partIndicator={'code':indicatorClass, 
                           'delta':indicatorValue, 
                           'color':partScale(indicatorValue).hex()};
         part.metrics.push(partIndicator);

        })
        
      });
      
    })
    
  });


}
/*************************************************/
var parseURL =  function(query){

  if (query == '') return null;
  var hash = {};
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    var k = decodeURIComponent(pair[0]);
    var isArray = false;
    if (k.substr(k.length-2) == '[]') {
      isArray = true;
      k = k.substring(0, k.length - 2);
    }
    var v = decodeURIComponent(pair[1]);
    // If it is the first entry with this name
    if (typeof hash[k] === "undefined") {
      if (isArray)  // not end with []. cannot use negative index as IE doesn't understand it
        hash[k] = [v];
      else
        hash[k] = v;
    // If subsequent entry with this name and not array
    } else if (typeof hash[k] === "string") {
      hash[k] = v;  // replace it
    // If subsequent entry with this name and is array
    } else {
      hash[k].push(v);
    }
  }
  return hash;
}; 

var getFullRoute = function(path){
 
   var part = null, chapter=null, section=null, fact=null, partCmp = null, chapterCmp=null, sectionCmp=null, factCmp=null;
   var components = parseURL(path)

   if(typeof $scope.course == 'undefined')
      console.log('Error')
  var result = $scope.course; 
  //if(components != null)
   
   if(components.hasOwnProperty('partid')) {
       part = $.grep($scope.course.tomes, function(e){ return  e._id == components.partid })[0];
       partCmp = {'id': part.id, 'route':part.route , 'title':part.title}
     }

   if(components.hasOwnProperty('chapid')) {
       chapter = $.grep(tome.chapters, function(e){ return  e._id == components.chapid })[0];
       chapterCmp = {'id': chapter.id, 'route':chapter.route , 'title':chapter.title}
     }

   if(components.hasOwnProperty('sectionid')) {
       section = $.grep(chap.parts, function(e){ return  e._id == components.sectionid })[0];
       sectionCmp = {'id': section.id, 'route':section.route , 'title':section.title}
     }

   
  
     
    var result={'part':partCmp, 'chapter':chapterCmp, 'section':sectionCmp}
 
     return result;
}
var resolveRoute = function(path){
 
   
   var components = parseURL(path)

   if(typeof $scope.course == 'undefined')
      console.log('Error')
  var result = $scope.course; 
  if(components != null)
   if(components.hasOwnProperty('partid')) {
    var tome = $.grep($scope.course.tomes, function(e){ return  e._id == components.partid })[0];
     result = tome
     if(components.hasOwnProperty('chapid')){
   var chap = $.grep(tome.chapters, function(e){ return  e._id == components.chapid })[0];
        result = chap
     
     if(components.hasOwnProperty('sectionid')){
  var part = $.grep(chap.parts, function(e){ return  e._id == components.sectionid })[0];
       result = part;
       if(components.hasOwnProperty('factid')){        
    var fact = $.grep(part.facts, function(e){ return  e._id == components.factid })[0];          
         result = fact
       }
      }
      else
        if(components.hasOwnProperty('factid')){
          var fact = $.grep(chap.facts, function(e){ return  e._id == components.factid })[0];          
          result = fact

        }
    }  
  }   
     
     
     return result;
}
var resetPath = function(){     
  $('.chosenPart').removeClass('chosenPart'); 
  $('.inspectorChosenPart').removeClass('inspectorChosenPart'); 
  $('.data-table').removeClass('highlight-table');
  $('#divOverlay').css('visibility','hidden');
  $('.inspector-item-selected').removeClass('inspector-item-selected');

  //$('.gly-issue').removeClass('fa fa-exclamation-circle');  
    

    for (var i = 0; i < $scope.context.Tasks.length; i++)   
      {$scope.context.Tasks[i].selected = 'notRelevantTask' }


}

var parseTask = function(path, content){
  var components = parseURL(path);
  var partid=0;
    var chapId=0;
    var partId=0;
    var taskId=0;
    var factId=0;
    var indicator='ALL';

  if(components != null){   
  var tome = components.hasOwnProperty('partid')?$.grep($scope.course.tomes, function(e){ return  e._id == components.partid })[0]:-1;
     if(tome!=-1) partid = tome._id
  var chap = components.hasOwnProperty('chapid')?$.grep(tome.chapters, function(e){ return  e._id == components.chapid })[0]:-1;
     if(chap!=-1) chapId = chap._id;
  var part  = components.hasOwnProperty('sectionid')?$.grep(chap.parts, function(e){ return  e._id == components.sectionid })[0]:-1;
      if(part!=-1) {
        partId = part._id;
        var fact = components.hasOwnProperty('factid')?$.grep(part.facts, function(e){ return  e._id == components.factid })[0]:-1;
        if(fact!=-1) {factId = fact._id; indicator=fact.classof}
      }
      else{
        var fact = components.hasOwnProperty('factid')?$.grep(chap.facts, function(e){ return  e._id == components.factid })[0]:-1;
          if(fact!=-1) {factId = fact._id; indicator=fact.classof}
        var indicator = components.hasOwnProperty('indicator')?components.indicator:'ALL';
      }
  
}


 
  
 var route = $scope.course._id+'/'+partid+'/'+chapId+'/'+partId+'/'+factId;
 var todo ={'classof':indicator, 'todo':content,'elementType':'todo'}
  return {'route':route, 'todo':todo}
}
var deparseTask = function(route){

  var components = parseURL(route);
  var partid=0;
    var chapId=0;
    var partId=0;
    var taskId=components.taskid;
    var factId=0;
    var taskIndicator= components.hasOwnProperty('indicator')?components.indicator :'ALL';
  if(components != null){   
  var tome = components.hasOwnProperty('partid')?$.grep($scope.course.tomes, function(e){ return  e._id == components.partid })[0]:-1;
     if(tome!=-1) partid = tome._id
  var chap = components.hasOwnProperty('chapid')?$.grep(tome.chapters, function(e){ return  e._id == components.chapid })[0]:-1;
     if(chap!=-1) chapId = chap._id;
  var part  = components.hasOwnProperty('sectionid')?$.grep(chap.parts, function(e){ return  e._id == components.sectionid })[0]:-1;
      if(part!=-1) {
        partId = part._id;
        var fact = components.hasOwnProperty('factid')?$.grep(part.facts, function(e){ return  e._id == components.factid })[0]:-1;
        if(fact!=-1) {factId = fact._id;}
      }
      else{
        var fact = components.hasOwnProperty('factid')?$.grep(chap.facts, function(e){ return  e._id == components.factid })[0]:-1;
          if(fact!=-1) {factId = fact._id; }

      }
  
}


 
  var result ="#";
 
 
result ="#";
if(partid==0){
  result = result +'taskid='+taskId;
}
else {
  result = result+'partid='+partid;
  if(chapId!=0) {
    result = result+'&chapid='+chapId;
    if(partId != 0){
      result = result+'&sectionid='+partId;
      if(factId != 0)
        result = result+'&factid='+factId;
    }
    else
      if(factId != 0)
        result = result+'&factid='+factId;

  }
  result = result + '&taskid=' + taskId;
}
//  result = result + ',' + chapId + ',' + partId + ',' + factId + ',' + taskId;

  if( taskIndicator!='ALL')    result = result + '&indicator=' + taskIndicator;

  return result;

}


var parseTaskRequest = function(path){ 

  var components = parseURL(path);
  var courseId=$scope.course._id;
  var tomeId=0;
    var chapId=0;
    var partId=0;
    var taskId=components.taskid;
    var factId=0;
    var taskIndicator= components.hasOwnProperty('indicator')?components.indicator :'ALL';
  if(components != null){   
  var tome = components.hasOwnProperty('partid')?$.grep($scope.course.tomes, function(e){ return  e._id == components.partid })[0]:-1;
     if(tome!=-1) tomeId = tome._id
  var chap = components.hasOwnProperty('chapid')?$.grep(tome.chapters, function(e){ return  e._id == components.chapid })[0]:-1;
     if(chap!=-1) chapId = chap._id;
  var part  = components.hasOwnProperty('sectionid')?$.grep(chap.parts, function(e){ return  e._id == components.sectionid })[0]:-1;
      if(part!=-1) {
        partId = part._id;
        var fact = components.hasOwnProperty('factid')?$.grep(part.facts, function(e){ return  e._id == components.factid })[0]:-1;
        if(fact!=-1) {factId = fact._id}
      }
      else{
        var fact = components.hasOwnProperty('factid')?$.grep(chap.facts, function(e){ return  e._id == components.factid })[0]:-1;
          if(fact!=-1) {factId = fact._id}

      }
  
}



 
  var route = courseId;
  var scope = 'course';


if(tomeId ==0){
route =route+'/0/'+taskId;
}
else
  if(chapId ==0){
    route =route+'/'+tomeId+'/0/'+taskId;
    scope ='tome';
  }
  else
    if(partId ==0){
      if(factId ==0){
      route = route+'/'+tomeId+'/'+chapId+'/0/'+taskId;
      scope ='chapter';
      }
      else{
        route = route+'/'+tomeId+'/'+chapId+'/'+factId+'/'+taskId;
        scope ='chapter';

      }
    }
    else
      {

        if(factId ==0){
          route = route+'/'+tomeId+'/'+chapId+'/'+partId+'/0/'+taskId;
          scope ='part';
        }
        else{
          route = route+'/'+tomeId+'/'+chapId+'/'+partId+'/'+factId+'/'+taskId;
          scope ='part';
        }
      }
  
  return {'route':route, 'scope':scope}
}


var computeComponentStats = function(element,bySection){ 

var componentData ={'interest':[],'Actions_tx':[],'readers_tx':[],'rs_tx':[],'speed':[],'rupture_tx':[], 'norecovery_tx':[],
'resume_past':[],'resume_future':[], 'rereads_tx':[],'rereads_seq_tx':[],'rereads_dec_tx':[],'reading_not_linear':[],
'resume_abnormal_tx':[],'provenance_not_linear':[],'provenance_past':[],'provenance_future':[],'destination_not_linear':[],'destination_past':[],'destination_future':[] }

var data=[];
var ids=[]

if(element.elementType=='chapitre'){
  data = $.grep($scope.courseChapters, function(e){ return  e._id ==element._id})[0];
  if(bySection){
    data = data.parts;

  }
  else{
    return;
  }
}
else
if(element.elementType=='partie'){
  data = $.grep($scope.course.tomes, function(e){ return  e._id ==element._id})[0];
  if(bySection){
    var tomeSecs = [];
    angular.forEach(data.chapters, function(chap){
      angular.forEach(chap.parts, function(p){
        tomeSecs.push(p)
      })

    });

    data = tomeSecs;

   
  }
  else{
     data = data.chapters;
  }

}
else
  return;

    angular.forEach(data, function(elt){
      componentData.Actions_tx.push(elt.indicators.Actions_tx);
      componentData.interest.push(elt.indicators.interest);
      componentData.readers_tx.push(elt.indicators.readers_tx);
      componentData.rs_tx.push(elt.indicators.rs_tx);
      componentData.speed.push(elt.indicators.speed);
      componentData.rupture_tx.push(elt.indicators.rupture_tx);
      componentData.norecovery_tx.push(elt.indicators.norecovery_tx);
      componentData.resume_abnormal_tx.push(elt.indicators.resume_abnormal_tx);
      componentData.resume_past.push(elt.indicators.resume_past);      
      componentData.resume_future.push(elt.indicators.resume_future);      
      componentData.rereads_tx.push(elt.indicators.rereads_tx);
      componentData.rereads_seq_tx.push(elt.indicators.rereads_seq_tx);
      componentData.rereads_dec_tx.push(elt.indicators.rereads_dec_tx);
      componentData.provenance_not_linear.push(elt.indicators.provenance_not_linear);
      componentData.reading_not_linear.push(elt.indicators.reading_not_linear);
      componentData.destination_not_linear.push(elt.indicators.destination_not_linear);
      ids.push(elt.id);
    });


var topData={
        'interest': d3.mean(componentData.interest ),
        'Actions_tx':d3.mean(componentData.Actions_tx ),
        'readers_tx':d3.mean(componentData.readers_tx ),
        'rs_tx':d3.mean(componentData.rs_tx ),
        'speed':d3.mean(componentData.speed ),
        'rupture_tx':d3.mean(componentData.rupture_tx ),        
        'norecovery_tx':d3.mean(componentData.norecovery_tx ),
        'resume_abnormal_tx':d3.mean(componentData.resume_abnormal_tx ),
        'resume_past':d3.mean(componentData.resume_past),
        'resume_future':d3.mean(componentData.resume_future),
        'rereads_tx':d3.mean( componentData.rereads_tx),
        'rereads_seq_tx':d3.mean( componentData.rereads_seq_tx),
        'rereads_dec_tx':d3.mean( componentData.rereads_dec_tx),
        'reading_not_linear':d3.mean( componentData.reading_not_linear),
        'provenance_not_linear':d3.mean( componentData.provenance_not_linear),
        'provenance_past':d3.mean( componentData.provenance_past),
        'provenance_future':d3.mean( componentData.provenance_future),
        'destination_not_linear':d3.mean( componentData.destination_not_linear),
        'destination_past':d3.mean( componentData.destination_past),
        'destination_future':d3.mean( componentData.destination_future),
        'ids':ids
      } 

  return topData;

}





var goHome = function(){ 

  window.location.hash = '#';
  //resetPath();

  //window.location.hash = '#';

  
}
$scope.goHome = function(){
  goHome();
}


$scope.taskContexter = function(task,$event) {
  var element = deparseTask(task.route);
 
  loadURL(element);
  //$($event.currentTarget).parent().blur();
  //$($event.currentTarget).parent().focus();

};

var saveLog = function(params) {
  if ($scope.course._id != undefined) 
        return $http.post('/api/courses/log/'+$scope.course._id,params);
      };

var addTask = function(route,params) {
        return $http.post('/api/tasks/add/'+route,params);
      };
var  deleteTask = function(params) {
        if(params.scope =='course')
          return $http.delete('/api/course/tasks/delete/'+params.route);  
        if(params.scope =='tome')
          return $http.delete('/api/tome/tasks/delete/'+params.route);  
        if(params.scope =='chapter')
          return $http.delete('/api/chapter/tasks/delete/'+params.route);  
        if(params.scope =='part')
          return $http.delete('/api/part/tasks/delete/'+params.route);  
      };
var editTask = function(params, task) { 
        if(params.scope =='course')          
          return $http.post('/api/course/tasks/edit/'+params.route, task);  
        if(params.scope =='tome')
          return $http.post('/api/tome/tasks/edit/'+params.route, task);  
        if(params.scope =='chapter')
          return $http.post('/api/chapter/tasks/edit/'+params.route, task);  
        if(params.scope =='part')
          return $http.post('/api/part/tasks/edit/'+params.route, task); 
        if(params.scope =='fact')
          return $http.post('/api/part/tasks/edit/'+params.route, task);  
      };
var getTasks = function(courseId, partId, todoData) {  
      if(courseId == partId) partId =0;      
        return $http.get('/api/tasks/get/'+courseId+'/'+partId)
        };
 
 var selectTab = function(tab){return;
  var components = parseURL(window.location.hash);
   ///////////// LOG ////////////
    if(components!=null)  saveLog({
            'name':'selectTab',
            'elementId':components._id,
            'params':[
             {'paramName':'url','paramValue':window.location.hash}] 
          });
      //////////////////////////////
      return;
   if((tab == 'facts')&($scope.inspectorFacts.Facts.length>0)){ //return;
    if(components == null)    
      loadURL($scope.inspectorFacts.Facts[$scope.currentFact].route);
    else
     if(components.hasOwnProperty('factid')) 
        if(components.factid != $scope.inspectorFacts.Facts[$scope.currentFact]._id)
          loadURL($scope.inspectorFacts.Facts[$scope.currentFact].route);

    window.setTimeout(function() {
      resetPath();
      $(".fact[data-fact-id='"+$scope.inspectorFacts.Facts[$scope.currentFact]._id+"']").parent()
      .addClass('inspectorChosenPart').fadeIn(100).fadeOut(100).fadeIn(200).focus().select();
    }, 0); 
   }
   else{
    resetPath();  
    window.setTimeout(function() {  
        
        loadURL($scope.context.statsURL+'&indicator='+$scope.context.indicator);
     }, 0); 
    
    
  }

}
var updateMainFacts = function(){  
  $scope.indicatorsHeader = resetIndicators($scope.course.dospeed);

//////////////// CHAPTERS

  var allFacts=[]; 
  angular.forEach($scope.course.tomes, function(tome) {
    angular.forEach(tome.chapters, function(chapter){

      angular.forEach(chapter.facts, function(f){
        f.parentTitle='Chapitre \"'+chapter.title+' \" '
         var indicator=f.issueCode
          var maxV = $scope.indicatorsHeader.filter(function(e){ return ((e.issueCode === f.issueCode))} );          
          f.mainFact=false;
          if(maxV.length>0) {   

            if($scope.indicatorsSelectionModel.indexOf(maxV[0].value)>=0){  
              maxV=maxV[0].chapterValue;
              if(f.delta>maxV) {
                f.mainFact=true;
                $scope.indicatorsHeader.filter(function(e){ return ((e.issueCode === f.issueCode))} )[0].chapterValue = f.delta;
                $scope.indicatorsHeader.filter(function(e){ return ((e.issueCode === f.issueCode))} )[0].chapterFactId = f._id
              }
              allFacts.push(f)
            }
                       
                      
          }

      })
    })
  })

  var mainFacts=[]; 
  $scope.indicatorsHeader.forEach(function(ind){
    if($scope.indicatorsSelectionModel.indexOf(ind.value)>=0){
      if(ind.chapterFactId!=null){
        var fact = allFacts.filter(function(e){return (e._id==ind.chapterFactId)})[0];
        mainFacts.push(fact);

      }      
    }
  }) 

 $scope.MainChaptersFacts =  mainFacts;
 $scope.AllChaptersFacts = allFacts;

 

 //////////////// SECTIONS
 

allFacts=[]; 
angular.forEach($scope.course.tomes, function(tome) {
    angular.forEach(tome.chapters, function(chapter){
      
      angular.forEach(chapter.parts, function(part){
        angular.forEach(part.facts, function(f){
          
          f.parentTitle='Section '+part.id+' ('+part.title+') '
          var indicator=f.issueCode
        var maxV = $scope.indicatorsHeader.filter(function(e){ return ((e.issueCode === f.issueCode))} );
        f.mainFact=false;
        if(maxV.length>0) {  
        if($scope.indicatorsSelectionModel.indexOf(maxV[0].value)>=0){         
            maxV=maxV[0].sectionValue;            
                if(f.delta>maxV) {
                  $scope.indicatorsHeader.filter(function(e){ return ((e.issueCode === f.issueCode))} )[0].sectionValue = f.delta;
                  $scope.indicatorsHeader.filter(function(e){ return ((e.issueCode === f.issueCode))} )[0].sectionFactId = f._id
                  f.mainFact=true;
                }
              }
         
        allFacts.push(f)
      }

      })
      })
    })
  })

 mainFacts=[];
  $scope.indicatorsHeader.forEach(function(ind){
  if($scope.indicatorsSelectionModel.indexOf(ind.value)>=0){
    if(ind.sectionFactId!=null){
      mainFacts.push(allFacts.filter(function(e){return (e._id==ind.sectionFactId)})[0])
    }
  }
  }) 

 $scope.MainSectionsFacts = mainFacts;
 $scope.AllSectionsFacts = allFacts;

}




var inspectorCourseData = function(tab){   

$scope.inspector={} 
var facts=[];
  if($scope.sectionDisplay) {
         facts = $scope.SectionsFacts;   

         $scope.inspectorStats.type='part'
  }
  else{
      facts= $scope.ChaptersFacts;
      $scope.inspectorStats.type='chapter';
  }

if(facts.length>0){
  $scope.inspectorFacts={
  'id':facts[0].partId,
  'type':facts[0].partType,
  'indicatorCode':facts[0].issueCode,
  'Facts': $.grep(facts,  function(e){return $scope.isIndicatorVisible(e.classof)})  

  };
  $scope.courseFacts = $scope.inspectorFacts;
}
  else
    $scope.inspectorFacts={'Facts':[]}


   $scope.inspector = $scope.inspectorStats;
   $scope.currentFact = 0;
    
$scope.inspectorStats.breadcrumbsData ={};
$scope.factTitleDisplay=true;
 
}

var inspectorTomeData = function(tome, indicator, fact, tab){  

  var mainIssues = [];
  var  mainStats = computeComponentStats(tome, $scope.sectionDisplay);
  
   //var code= (tab=='stats')?$scope.inspectorStats.indicatorCode:'Actions_tx';
   var code=$scope.inspectorStats.indicatorCode;
   if($scope.sectionDisplay){ 
       mainIssues = $scope.SectionsFacts;

      $scope.factTitleDisplay=true;
       $scope.inspectorStats = {'type':'part',
                   'id':mainStats.ids,
                   'part_id':tome.part_id,
                   'mairoute':tome.route,
                   'breadcrumbsData': tome.fullpath,
                   'typeTxt': 'cette partie',
                   'indicatorTxt': 'tous les indicateurs',
                   'indicatorCode':code,                  
                    'Indicators' :[
                    {'name':'Actions_tx','value':  d3.round(100*mainStats.Actions_tx,1)+'%',
                      'comment':'est le taux moyen de visite des sections de cette partie'} ,
                    {'name':'readers_tx','value':  d3.round(100*mainStats.readers_tx,1)+'%',
                      'comment':'est le taux moyen de lecteurs des sections de cette partie'} ,
                    {'name':'rs_tx','value':  d3.round(100*mainStats.rs_tx,1)+'%',
                      'comment':'est le taux moyen des séances de lecture contenant les sections de cette partie'} ,
                      {'name':'speed','value':   d3.round(mainStats.speed)+' mots par minutes',
                      'comment':'est la vitesse moyenne de lecture des sections de cette partie'},  

                    {'name':'rereads_tx','value':  d3.round(100*mainStats.rereads_tx)+'%',
                      'comment':'est le taux moyen de relecture des sections de cette partie'},

                   {'name':'norecovery_tx', 'value':  d3.round(100*mainStats.norecovery_tx)+'%',
                      'comment':'est le taux moyen des arrêts définitfs de la lecture sur les sections de cette partie'} ,
                    {'name':'resume_past', 'value':  d3.round(100*mainStats.resume_past)+'%',
                      'comment':'est le taux moyen des arrêts avec retour en arrière de la lecture sur les sections de cette partie'} 
                      ]    
                    
                  };
    }
  else{
    mainIssues = $scope.ChaptersFacts;
    $scope.inspectorStats = {'type':'chapter',
                   'id':mainStats.ids,
                   'part_id':tome.part_id,
                   'mairoute':tome.route,
                   'breadcrumbsData': tome.fullpath,
                   'typeTxt': 'cette partie',
                   'indicatorTxt': 'tous les indicateurs',
                    'indicatorCode':code,
                    'Indicators' :[
                    {'name':'interest','value':  d3.round(100*mainStats.interest,1)+'%',
                      'comment':'est le taux d\'intérêt moyen des chapitres de cette partie'},
                       {'name':'Actions_tx','value':  d3.round(100*mainStats.Actions_tx,1)+'%',
                      'comment':'est le taux moyen de visite des chapitres de cette partie'},
                    {'name':'readers_tx','value':  d3.round(100*mainStats.readers_tx,1)+'%',
                      'comment':'est le taux moyen de lecteurs des chapitres de cette partie'} ,
                    {'name':'rs_tx','value':  d3.round(100*mainStats.rs_tx,1)+'%',
                      'comment':'est le taux moyen des séances de lecture contenant les chapitres de cette partie'} ,
                      {'name':'speed','value':   d3.round(mainStats.speed)+' mots par minutes',
                      'comment':'est la vitesse moyenne de lecture des chapitres de cette partie'},

                    {'name':'reading_not_linear','value':  d3.round(100*mainStats.reading_not_linear,1)+'%',
                      'comment':'est le taux moyen de linéarité de la lecture des chapitres de la partie'},
                    {'name':'provenance_not_linear','value':   d3.round(100 * (1-tome.transitions.provenance.normal))+'%',
                      'comment':'est le taux moyen des provenances non linéaires des chapitres de la partie'},
                    {'name':'provenance_past','value':   d3.round(100 * tome.transitions.provenance.past)+'%',
                      'comment':'est le taux moyen des arrivées vers les chapitres de cette partie et provenant des chapitres plus en arrière'},
                    {'name':'provenance_future','value':   d3.round(100 * tome.transitions.provenance.future)+'%',
                      'comment':'est le taux moyen des arrivées vers les chapitres de cette partie et provenant des chapitres plus en avant'},
                    {'name':'destination_not_linear','value':   d3.round(100 * (1-tome.transitions.destination.normal))+'%',
                      'comment':'est le taux moyen des destinations depuis les chapitres de cette partie vers des chapitres autres que ceux qui suivent directement'},
                    {'name':'destination_past','value':   d3.round(100 * tome.transitions.destination.past)+'%',
                      'comment':'est le taux moyen des départ depuis les chapitres de cette partie vers des chapitres plus en arrière'},
                    {'name':'destination_future','value':   d3.round(100 * tome.transitions.destination.future)+'%',
                      'comment':'est le taux moyen des départ depuis les chapitres de cette partie vers des chapitres plus en avant'},

                    {'name':'rereads_tx','value':  d3.round(100*mainStats.rereads_tx)+'%',
                      'comment':'est le taux moyen de relecture des chapitres de cette partie'},
                    {'name':'rereads_seq_tx','value':  d3.round(100*mainStats.rereads_seq_tx)+'%',
                      'comment':'est le taux moyen des relectures des chapitres de cette partie et qui ont lieu  se font au sein des mêmes séances de lecture'},
                    {'name':'rereads_dec_tx','value':  d3.round(100*mainStats.rereads_dec_tx)+'%',
                      'comment':'est le taux moyen des relectures des chapitres de cette partie et qui ont lieu  se font dans des séances de lecture distinctes'},
                    
                    {'name':'rupture_tx', 'value':  d3.round(100*mainStats.rupture_tx)+'%',
                      'comment':'est le taux moyen des fins de séances de lecture ayant lieu sur les chapitres de cette partie'}  ,
                   {'name':'norecovery_tx', 'value':  d3.round(100*mainStats.norecovery_tx)+'%',
                      'comment':'est le taux moyen des arrêts définitfs de la lecture sur les chapitres de cette partie'}  ,
                    {'name':'resume_past', 'value':  d3.round(100*mainStats.resume_past)+'%',
                      'comment':'est le taux moyen des arrêts sur les chapitres de cette partie suivis de retour en arrière lors de la reprise de la lecture'} ,
                    {'name':'resume_future', 'value':  d3.round(100*mainStats.resume_future)+'%',
                      'comment':'est le taux moyen des arrêts sur les chapitres de cette partie suivis de sauts importants en avantlors de la reprise de la lecture'} 
                      ]    
                    
                  };
                  
  }
  
$scope.factTitleDisplay=true;
  var times =[], users =[], rss =[], rereads_tx =[], norecovery_txs =[];


return;
}

var inspectorChapterData = function(chapter, indicator, fact, tab){ 
  
  var mainIssues = [], mainStats = [];
  //var code= (tab=='stats')?$scope.inspectorStats.indicatorCode:'Actions_tx';
  var code=$scope.inspectorStats.indicatorCode;
  if($scope.sectionDisplay) {
    
      mainIssues= $scope.SectionsFacts;
      mainStats = computeComponentStats(chapter, $scope.sectionDisplay)
      $scope.factTitleDisplay=true;
       $scope.inspectorStats = {'type':'section',
                   //'id':mainStats.ids,
                   'mainroute':chapter.route,
                   'part_id':chapter.part_id,
                   'typeTxt': 'ce chapitre',
                   'breadcrumbsData': chapter.fullpath,
                   'indicatorTxt': 'tous les indicateurs',
                   'indicatorCode':code,                  
                    'Indicators' :[
                    {'name':'Actions_tx','value':  d3.round(100*mainStats.Actions_tx,1)+'%',
                      'comment':'est le taux moyen de visite des sections de ce chapitre'},
                      {'name':'readers_tx','value':  d3.round(100*mainStats.readers_tx,1)+'%',
                      'comment':'est le taux moyen des lecteurs de ce chapitre'} ,
                    {'name':'rs_tx','value':  d3.round(100*mainStats.rs_tx,1)+'%',
                      'comment':'est le taux moyen des séances de lecture contenant ce chapitre'} ,
                    {'name':'speed','value':   mainStats.speed+' mots par minutes',
                      'comment':'est la vitesse moyenne de lecture des sections de ce chapitre'},
                    {'name':'rereads_tx','value':  d3.round(100*mainStats.rereads_tx)+'%',
                      'comment':'est le taux moyen de relecture des sections de ce chapitre'},
                    {'name':'norecovery_tx', 'value':  d3.round(100*mainStats.norecovery_tx)+'%',
                      'comment':'est le taux moyen des arrêts définitfs de la lecture sur les sections de ce chapitre'}  
                      ]    
                    
                  };
    }
  else{
    mainIssues= $scope.ChaptersFacts;
    $scope.factTitleDisplay=false;
    $scope.inspectorStats = {'type':'chapter',
                   'id':chapter.id,
                   'part_id':chapter.part_id,
                   'mairoute':chapter.route,
                   'typeTxt': 'ce chapitre',
                   'breadcrumbsData': chapter.fullpath,
                   'indicatorTxt': 'tous les indicateurs',
                   'indicatorCode':code,                  
                    'Indicators' :[
                    {'name':'interest','value':d3.round(100*chapter.indicators.interest,1)+'%',
                      'comment':' est le taux d\'intérêt normalisé calculé sur ce chapitre',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id &f.classof === 'interest')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'interest'})[0].route:null},

            {'name':'Actions_tx','value':d3.round(100*chapter.indicators.Actions_tx,1)+'%',
                      'comment':' des visites sur le cours ont été observées sur ce chapitre ('+chapter.indicators.nbactions+' actions)',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id &f.classof === 'Actions_tx')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'Actions_tx'})[0].route:null},

                   {'name':'readers_tx','value':d3.round(100*chapter.indicators.readers_tx,1)+'%',
                      'comment':' des lecteurs du cours ont visité ce chapitre',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id &f.classof === 'readers_tx')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'readers_tx'})[0].route:null},
            
            {'name':'rs_tx','value':d3.round(100*chapter.indicators.rs_tx,1)+'%',
                      'comment':' des séances de lecture contiennent ce chapitre',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id &f.classof === 'rs_tx')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'rs_tx'})[0].route:null},

                      {'name':'speed','value':chapter.indicators.speed+' mots par minute',
                      'comment':'est la vitesse moyenne de lecture sur ce chapitre',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id & f.classof === 'speed')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'speed'})[0].route:null},

                    {'name':'rereads_tx','value':d3.round(100*chapter.indicators.rereads_tx,1)+'%',
                      'comment':'des lectures de ce chapitre sont des relectures',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id & f.classof === 'rereads_tx')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'rereads_tx'})[0].route:null},
                    {'name':'rereads_seq_tx','value':d3.round(100*chapter.indicators.rereads_seq_tx,1)+'%',
                      'comment':'des relectures de ce chapitre se font au cours des mêmes séances de lecture',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id & f.classof === 'rereads_seq_tx')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'rereads_seq_tx'})[0].route:null},
                    {'name':'rereads_dec_tx','value':d3.round(100*chapter.indicators.rereads_dec_tx,1)+'%',
                      'comment':'des relectures de ce chapitre se font dans des séances de lecture distinctes',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id & f.classof === 'rereads_dec_tx')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'rereads_dec_tx'})[0].route:null},

                    {'name':'reading_not_linear','value':d3.round(100*chapter.indicators.reading_not_linear,1)+'%',
                      'comment':'des chapitres lus avant et/ou après sont des chapitres lointains',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id & f.classof === 'reading_not_linear')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'reading_not_linear'})[0].route:null},
                      {'name':'provenance_not_linear','value':d3.round(100*chapter.indicators.provenance_not_linear,1)+'%',
                      'comment':'des chapitres lus avant celui-ci se situent loin du chapitre qui précède ce dernier (provenance non linéaire)',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id & f.classof === 'provenance_not_linear')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'provenance_not_linear'})[0].route:null},
                    {'name':'provenance_past','value':d3.round(100*chapter.indicators.provenance_past,1)+'%',
                      'comment':'des chapitres lus avant celui-ci se situent avant ce chapitre et celui qui le précède',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id & f.classof === 'provenance_past')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'provenance_past'})[0].route:null},
                    {'name':'provenance_future','value':d3.round(100*chapter.indicators.provenance_future,1)+'%',
                      'comment':'des chapitres lus avant celui-ci se situent après ce chapitre',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id & f.classof === 'provenance_future')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'provenance_future'})[0].route:null},
                    {'name':'destination_not_linear','value':d3.round(100*chapter.indicators.destination_not_linear,1)+'%',
                      'comment':'des chapitres lus après celui-ci se situent loin du chapitre qui suit ce dernier (destination non linéaire)',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id & f.classof === 'destination_not_linear')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'destination_not_linear'})[0].route:null},
                    {'name':'destination_past','value':d3.round(100*chapter.indicators.destination_past,1)+'%',
                      'comment':'des chapitres lus après celui-ci se situent avant ce chapitre (retour en arrière)',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id & f.classof === 'destination_past')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'destination_past'})[0].route:null},
                    {'name':'destination_future','value':d3.round(100*chapter.indicators.destination_future,1)+'%',
                      'comment':'des chapitres lus après celui-ci se situent bien après ce chapitre et celui qui le suit (avance importante)',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id & f.classof === 'destination_future')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'destination_future'})[0].route:null},


                    {'name':'norecovery_tx','value':d3.round(100*chapter.indicators.norecovery_tx,1)+'%',
                      'comment':'des arrêts définitifs de la lecture se passent sur ce chapitre',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id & f.classof === 'norecovery_tx')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'norecovery_tx'})[0].route:null},
                    {'name':'rupture_tx','value':d3.round(100*chapter.indicators.rupture_tx,1)+'%',
                      'comment':'des fins de séances de lecture se passent sur ce chapitre',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id & f.classof === 'rupture_tx')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'rupture_tx'})[0].route:null},
                    {'name':'resume_past','value':d3.round(100*chapter.indicators.resume_past,1)+'%',
                      'comment':'des reprises de lecture après un fin de séance sur ce chapitre se passent sur des chapitres en arrière, situés avant ce dernier dans la structure du cours',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id & f.classof === 'resume_past')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'resume_past'})[0].route:null},
                    {'name':'resume_future','value':d3.round(100*chapter.indicators.resume_future,1)+'%',
                      'comment':'des reprises de lecture après un fin de séance sur ce chapitre se passent sur des chapitres plus en avant, situés après ce dernier et celui qui suit dans la structure du cours',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id & f.classof === 'resume_future')}).length > 0)?
            chapter.facts.filter(function(f){ return f.classof === 'resume_future'})[0].route:null}
                      ]    
                    
                  };
  } 

  var code= (tab=='stats')?$scope.inspectorStats.indicatorCode:$scope.indicatorsSelectionModel[0];
  
/*
if(indicator!=null) {
  $scope.inspectorStats.Indicators = $scope.inspectorStats.Indicators.filter(function(e){return (e.name==indicator)});
  $scope.inspectorStats.indicatorTxt="l'indicateur selectionné"
}
  
var facts = mainIssues.filter(function(e){return (e.chapter==chapter._id)});
if(facts.length>0)
  {
     $scope.inspectorFacts = {
    'id':facts[0].partId,
    'type':facts[0].partType,
    'indicatorCode':facts[0].issueCode,
    'Facts':$.grep(facts,  function(e){return ($.inArray(e.classof, $scope.indicatorsSelectionModel)>-1)}) 
  }

    
    if(indicator!=null) $scope.inspectorFacts.Facts = $scope.inspectorFacts.Facts.filter(function(e){return (e.classof==indicator)});
    if(fact!=null)
     $scope.inspectorFacts.Facts = $scope.inspectorFacts.Facts.filter(function(e){return (e.classof==fact)})
  }
    else $scope.inspectorFacts={'Facts':[]}
  

      $('.inspectorChosenPart').removeClass('inspectorChosenPart');

 if(( $scope.inspectorFacts.Facts.length>0) & (tab=='facts')) 
     {


      
      var fact = $scope.inspectorFacts.Facts[0];
    $(".fact[data-fact-id='"+fact._id+"']").parent().addClass('inspectorChosenPart').fadeIn(100).fadeOut(100).fadeIn(200).focus().select();
    }
  else
      */
}

var inspectorSectionData = function(section, indicator, fact, tab){  
  $scope.factTitleDisplay=false;
 var mainIssues = $scope.SectionsFacts;
  //var code= (tab=='stats')?$scope.inspectorStats.indicatorCode:'Actions_tx';
  var code=$scope.inspectorStats.indicatorCode;
    $scope.inspectorStats = {'type':'part',
                   'id':section.id,
                   'part_id':section.part_id,
                   'mairoute':section.route,
                   'typeTxt': 'cette section',
                   'breadcrumbsData': section.fullpath,
                   'indicatorTxt': 'tous les indicateurs',
                   'indicatorCode':code,
                    'Indicators' :[
                    {'name':'Actions_tx','value':d3.round(100*section.indicators.Actions_tx,1)+'%',
                      'comment':' des visites sur le cours ont été observées sur cette section('+section.indicators.nbactions+' actions)',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==section.id &f.classof === 'Actions_tx')}).length > 0)?
            section.facts.filter(function(f){ return f.classof === 'Actions_tx'})[0].route:null},
                      {'name':'speed','value':section.indicators.speed+' mots par minute',
                      'comment':'est la vitesse moyenne de lecture sur cette section',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==section.id & f.classof === 'speed')}).length > 0)?
            section.facts.filter(function(f){ return f.classof === 'speed'})[0].route:null},
                    {'name':'rereads_tx','value':d3.round(100*section.indicators.rereads_tx,1)+'%',
                      'comment':'des lectures de cette section sont des relectures',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==section.id & f.classof === 'rereads_tx')}).length > 0)?
            section.facts.filter(function(f){ return f.classof === 'rereads_tx'})[0].route:null},
                    {'name':'norecovery_tx','value':d3.round(100*section.indicators.norecovery_tx,1)+'%',
                      'comment':'des arrêts définitifs de la lecture se passent sur cette section',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==section.id & f.classof === 'norecovery_tx')}).length > 0)?
            section.facts.filter(function(f){ return f.classof === 'norecovery_tx'})[0].route:null}
                      ]       
                    
                  };
}     


 
    

var computeGranuleData = function(granularity, element, indicator, fact, tab){
if(typeof tab=='undefined') tab='facts'
switch(granularity){
  case 'course':
    inspectorCourseData(tab);
  break;
  case 'tome':
    inspectorTomeData(element, indicator, fact, tab);
    break;
  case 'chapter':
    inspectorChapterData(element, indicator, fact, tab);
    break
  case 'part':
    inspectorSectionData(element, indicator, fact, tab);
    break

  }
if($scope.inspectorStats.Indicators!=undefined){
  //var nd = $scope.inspectorStats.Indicators.filter(function(f){ return $scope.indicatorsSelectionModel.indexOf(f.name)>=0});
  //$scope.inspectorStats.Indicators =  nd
}

}

var factSelector = function(currentElt){

  //if($scope.context.indicator == "ALL") $scope.context.indicator = $scope.indicatorsSelectionModel[0];
  //console.log( $scope.context.indicator)
   var facts = $.grep($scope.inspectorFacts.Facts, function(e){ return  e.classof == $scope.context.indicator});

   if(facts==null) return;
   var fact = $.grep(facts, function(e){ return  e.partId == currentElt.id })[0]
   if(fact==null) fact = facts[0];

   

   var factID = $scope.inspectorFacts.Facts.indexOf(fact);
   return;
   if(factID>-1)
    if(factID != $scope.currentFact) 
      $scope.currentFact = factID;
  
}


/********************************************/
var loadContext = function(){

  var width = $('.data-table').innerWidth() ;
  var top = $('.data-table').offset().top + $('.data-table').innerHeight();
  var left = $('.data-table').offset().left;

   var url = location.hash.slice(1);
   
 
   var element = resolveRoute(url);

   $scope.context.route = url;
   
   //$scope.context.Tasks =element.todos; 

   
   var path = url;
   resetPath();
   var task = null;
    var indicator = 'ALL'
  
  
  var course  = $scope.course;
  var components = parseURL(path)

  if(components == null){
    var tome=-1;
     
     //$scope.context.statsURL ={'url': "#", 'indicator':'ALL'}

    $scope.tabSelect = 'stats';

   // selectTab('stats');
  }
  else{
    var tome = components.hasOwnProperty('partid')?$.grep(course.tomes, function(e){ return  e._id == components.partid })[0]:-1;
     var chap = components.hasOwnProperty('chapid')?$.grep(tome.chapters, function(e){ return  e._id == components.chapid })[0]:-1;
    var part  = components.hasOwnProperty('sectionid')?$.grep(chap.parts, function(e){ return  e._id == components.sectionid })[0]:-1;     
    var partElt = -1;
    var tab=components.hasOwnProperty('tab')?components.tab:'facts';
    var fact  = components.hasOwnProperty('factid')? 
                (
                  (part==-1)?($.grep(chap.facts, function(e){ return  e._id == components.factid })[0]):
                             ($.grep(part.facts, function(e){ return  e._id == components.factid })[0])
                  ): -1;
    if(fact!=-1) 
        {
            indicator = fact.classof;
            $scope.context.indicator = fact.classof;
        }

    

    task = components.hasOwnProperty('taskid')?   $.grep(course.todos, function(e){ return  e._id == components.taskid })[0]:null;
    indicator = components.hasOwnProperty('indicator')? 
                            components.indicator:indicator;
    
     
     
      $scope.context.indicator = components.hasOwnProperty('indicator')? components.indicator:$scope.context.indicator;      
            $scope.context.statsURL=path;

             if(indicator == "ALL") indicator = $scope.context.indicator;
$scope.inspectorStats.indicatorCode = indicator;
$scope.$apply();

   
  }
  


  if(tome==-1) {        
    
        computeGranuleData('course',tab);
        $scope.context.taskText ='(nouvelle tâche)';
        $scope.context.taskPanelMiniTitle='Cours'
        selectCourse(indicator, task); 
        
        $scope.currentElement = {'id': null, route:'#', 'type':'course'};  
        

    }
    else
     if(chap ==-1) {
       task = components.hasOwnProperty('taskid')?$.grep(tome.todos, function(e){ return  e._id == components.taskid })[0]:null;

       computeGranuleData('tome',tome,null, null,tab);
      partElt = $('.tome_index[data-part ='+tome.id+']')[0];
      $scope.context.taskText ='(nouvelle tâche pour cette partie)'; 
      $scope.context.taskPanelMiniTitle='Partie: '+tome.title;
      selectTome(partElt, task);
      
      $scope.currentElement = {'id': tome.id, route:tome.route, 'type':'chapter'};  
      factSelector(tome);
    }
    else
      if(part==-1){
        task = components.hasOwnProperty('taskid')?$.grep(chap.todos, function(e){ return  e._id == components.taskid })[0]:null;
        if(fact!=-1){
          if($scope.sectionDisplay)
            $scope.setSectionDisplay(false);
          

          task = components.hasOwnProperty('taskid')?   $.grep(fact.todos, function(e){ return  e._id == components.taskid })[0]:null;
          partElt = $('.part_index[data-part ='+chap.id+']'); 
          $scope.context.taskText ='(nouvelle tâche pour ce chapitre)';
          $scope.context.taskPanelMiniTitle='Chapitre: '+chap.title;
          $scope.inspectorDisplaySrc='inspector';           
          computeGranuleData('chapter', chap, fact.classof, fact.classof,tab);      
          selectFact(chap.route, task, fact, indicator);
          $scope.currentElement = {'id': chap.id, route:chap.route, 'type':'chapter'};  
          factSelector(chap);
          

          
          
        }
        else
        if((indicator =="ALL")&($scope.context.indicator =="ALL")){
          computeGranuleData('chapter', chap, null, null,tab);
          partElt = $('.chapter_index[data-part ='+chap.id+']')[0];   
          $scope.context.taskText ='(nouvelle tâche pour ce chapitre)';
          $scope.context.taskPanelMiniTitle='Chapitre: '+chap.title;
          selectChapter(partElt, task, "ALL");
          $scope.currentElement = {'id': chap.id, route:chap.route, 'type':'chapter'}; 
          factSelector(chap);

          
          
        }
        else{
         
          if(indicator=='ALL') indicator = $scope.context.indicator;
          computeGranuleData('chapter', chap, null, null,tab);
          partElt = $('.chapter_index[data-part ='+chap.id+']')[0];
          $scope.context.taskText ='(nouvelle tâche pour ce chapitre)';
          $scope.context.taskPanelMiniTitle='Chapitre: '+chap.title;
          $scope.inspectorDisplaySrc='inspector' ;

         

         selectChapter(partElt, task, indicator);
         $scope.currentElement = {'id': chap.id, route:chap.route, 'type':'chapter'}; 
         factSelector(chap);
          
          
        }
      }
      else{
        if(!$scope.sectionDisplay)
          $scope.setSectionDisplay(true);
        

        task = components.hasOwnProperty('taskid')?$.grep(part.todos, function(e){ return  e._id == components.taskid })[0]:null;
        if(fact!=-1){
          task = components.hasOwnProperty('taskid')?   $.grep(fact.todos, function(e){ return  e._id == components.taskid })[0]:null;
          partElt = $('.part_index[data-part ='+part.id+']'); 
          computeGranuleData('part', part, fact.classof, fact.classof,tab);          
          $scope.context.taskText ='(nouvelle tâche pour ce problème)';
          $scope.context.taskPanelMiniTitle='Section: '+part.title;
          $scope.inspectorDisplaySrc='inspector';           
          selectFact(part.route, task, fact, indicator);
          $scope.currentElement = {'id': part.id, route:part.route, 'type':'part'}; 
          factSelector(part);
          
          
        }
        else
        if(indicator =="ALL"){ 
          computeGranuleData('part', part, null, null,tab); 
          //$scope.sectionDisplay = true;
          partElt = $('.part_index[data-part ='+part.id+']');   
          $scope.context.taskText ='(nouvelle tâche pour cette section)'; 
          $scope.context.taskPanelMiniTitle='Section: '+part.title;
          selectSection(partElt, task, "ALL");
          $scope.currentElement = {'id': part.id, route:part.route, 'type':'part'}; 
          factSelector(part);
          
          
        }
        else{
          computeGranuleData('part', part, null, null,tab); 
          partElt = $('.part_index[data-part ='+part.id+']');  
          $scope.context.taskText ='(nouvelle tâche pour cette section)';
          $scope.context.taskPanelMiniTitle='Section: '+part.title;
          
          $scope.inspectorDisplaySrc='inspector';
          
          $scope.inspectorStats.indicatorCode = indicator;
          selectSection(partElt, task, indicator);
          $scope.currentElement = {'id': part.id, route:part.route, 'type':'part'}; 
          factSelector(part);
        }
        
      }

/*************************************************/
                
if(components != null)
  $scope.tabSelect = components.hasOwnProperty('factid')?'facts':'stats';

 

}



window.onresize = function(){
   ///////////// LOG ////////////
      saveLog({
            'name':'resive',
            'elementId':$scope.course._id,
            'params':[] 
          });
      //////////////////////////////
   $scope.$broadcast('content.reload');

}

var reloadURL = function(){ 
  var url = window.location.hash
  window.setTimeout(function() { window.location.hash = url  }, 0);
}


var loadURL = function(url){ window.location.hash = url };

$scope.loadURL = loadURL;




var filterTasks = function(element, indicator, task){ 

  //if(indicator ==='ALL'){
       angular.forEach(element.todos, function(todo){
   var results = $.grep($scope.context.Tasks, function(e){ return  e._id == todo._id})[0]
        if(typeof results !== 'undefined') results.selected ='relevantTask';
      });
      angular.forEach(element.facts, function(fact){
        angular.forEach(fact.todos, function(todo){
   var results = $.grep($scope.context.Tasks, function(e){ return  e._id == todo._id})[0];
        if(typeof results !== 'undefined') results.selected ='relevantTask';
      })
      });
 /*   }
    else{
       angular.forEach(element.todos, function(todo){
 var results = $.grep($scope.context.Tasks, function(e){ return  e._id == todo._id && e.classof ==indicator})[0]
      if(typeof results !== 'undefined') results.selected ='relevantTask';
        });
        angular.forEach(element.facts, function(fact){
          angular.forEach(fact.todos, function(todo){
     var results = $.grep($scope.context.Tasks, function(e){ return  e._id == todo._id && e.classof ==indicator})[0];
          if(typeof results !== 'undefined') results.selected ='relevantTask';
        })
        });
    };*/


    if(task != null){
      
     
      var task_id =  task._id;

 var selection = $.grep($scope.context.Tasks, function(e){ return  e._id == task_id})[0];
 
 
selection.selected ='selectedTask';


      
    }
   

}

 var selectFact = function(url, task,fact, indicator) {
  
  $('.td_issue[data-path ="'+url+'"]').addClass('chosenPart');
  $scope.context.route = url;     

  var element = resolveRoute(url);
  
      
 
     $scope.context.inspector_title = element.title;
     $scope.courseDisplay = false;  
 

  var factID = $scope.inspectorFacts.Facts.indexOf(fact);

  if(factID > -1 )    
      $scope.setPage(factID);
  
 $scope.context.statsURL = url;
 $scope.context.indicator = indicator;

  filterTasks(element, indicator, task);
  $scope.currentElement.id = fact.partId;


    $scope.inspectorStats.indicatorCode = fact.issueCode;


  $('.factScroller').scroll();
 }


var selectIndictor = function(indicator){ 

  if(indicator ==='ALL') 
    $('#data-table').addClass('highlight-table');
  else{

    var rowTop = $('.indicators-header[data-indicator ="'+indicator+'"]').parent().offset();
    var topTop = rowTop.top;
    var left = rowTop.left;

    var width = $('.data-table').innerWidth() ;
    var height =  $('.indicators-header[data-indicator ="'+indicator+'"]').innerHeight();


    var rowBottom = $('.data-table tbody tr:last-child').offset();
    var topBottom = rowBottom.top;

    $('#divOverlay').offset({top:topTop - 2 ,left:left - 2});
    $('#divOverlay').height(height);
    $('#divOverlay').width(width);
    $('#divOverlay').css('visibility','visible');
    $('#divOverlay').slideDown('fast');    
  }  
 $scope.$apply();
}




var selectSection = function(partElt, task, indicator){   

  var route = $(partElt).attr('data-path');

  var element =resolveRoute(route);  
$scope.context.url = element.url;

  resetPath();
  
$scope.context.inspector_title = "Section : "+element.title;
$scope.courseDisplay = false;
var url = element.route;
$scope.context.route = url; 

var index = $(partElt).index() + 1;

  
  setTimeout(function() {
    var rowTop = $('.parts-header > th:nth-child('+index+')').offset();
    var topTop = rowTop.top;
    var left = rowTop.left;

    var oneWidth = $('.parts-header > th:nth-child('+index+')').innerWidth();
    //$('.parts-header > th:nth-child('+index+')').addClass('chosenPart')
    var height = $('.data-table').innerHeight() - $('.chapters-header th:first').innerHeight() - $('.tomes-header th:first').innerHeight();



     $('#divOverlay').offset({top:topTop -2 ,left:left - 2});
      $('#divOverlay').height(height);
      $('#divOverlay').width(oneWidth);
      $('#divOverlay').css('visibility','visible');
    $('#divOverlay').delay(200).slideDown('fast');

     if(indicator!='ALL'){
       url =route+'&indicator='+indicator; 
        $('.td_issue[data-path ="'+url+'"]').addClass('chosenPart');
 
  }

  
  }, 0);

if(indicator=='ALL'){
  filterTasks(element, 'ALL', task);
$scope.context.url = element.url;

}
else{ 
  url =url+'&indicator='+indicator; 
  element = resolveRoute(url);
  filterTasks(element, indicator, task);
}

    

    $scope.inspectorDisplaySrc='inspector'
 
}


var selectCourse = function(indicator, task){ 
  resetPath(); 
   $scope.inspectorDisplaySrc='course' ;

  $scope.indicatorInspectorShow = indicator;
  
  //if(indicator==='ALL')
  $scope.context.inspector_title = "Cours : "+$scope.course.title;// +" - " +$scope.context.subfacts.length +" problèmes potentiels";
  $scope.courseDisplay = true;
  $scope.context.url = $scope.course.url;

    


$scope.observedElt ={'type':'course',
      'id':0,
  'typeTxt':'Ce cours',
  'indicatorTxt': 'tous les indicateurs'
    };




  resetPath(); 
  $('#data-table').addClass('highlight-table');
  filterTasks($scope.course, indicator,task);
  angular.forEach($scope.course.tomes, function(tome){
  filterTasks(tome, indicator, task);
  angular.forEach(tome.chapters, function(chapter){
    filterTasks(chapter, indicator, task);
    angular.forEach(chapter.parts, function(part){
      filterTasks(part,indicator,task)
    })
  })
});
  


    

}


var selectTome = function(partElt, task){ 
resetPath();

  var route = $(partElt).attr('data-path');
  var element =resolveRoute(route);  
  
  

$scope.context.inspector_title = "Partie : "+element.title
$scope.courseDisplay = false;

$scope.context.url = element.url;

$scope.inspectorDisplaySrc='inspector'
    

var index = $(partElt).index() + 1
    
  
  
    var rowTop = $('.tomes-header> th:nth-child('+index+')').offset();
  var topTop = rowTop.top;
  var left = rowTop.left;
  //$('.tomes-header> th:nth-child('+index+')').addClass('chosenPart')

  var oneWidth = $('.tomes-header> th:nth-child('+index+')').innerWidth();
  var height = $('.data-table').innerHeight() ;


  var rowBottom = $('.data-table tbody tr:last-child > td:nth-child('+index+')').offset();
  var topBottom = rowBottom.top;

  $('#divOverlay').offset({top:topTop - 3 ,left:left - 2});
  $('#divOverlay').height(height);
  $('#divOverlay').width(oneWidth);
   $('#divOverlay').css('visibility','visible');
  $('#divOverlay').delay(200).slideDown('fast');
  

  filterTasks(element, 'ALL', task);
 
    
  //}, 10);

    $scope.context.mainstats = element.mainstats;

}

var selectChapter = function(partElt, task, indicator){  
resetPath(); 

  var route = $(partElt).attr('data-path');

  var element =resolveRoute(route);  
  $scope.context.url = element.url;

  
$scope.context.inspector_title = "Chapitre : "+element.title;
$scope.courseDisplay = false;
var url = element.route;
$scope.context.route = url; 



var index = $(partElt).index() + 1;



  var rowTop = $('.chapters-header> th:nth-child('+index+')').offset();

  var topTop = rowTop.top;
  var left = rowTop.left;

  var oneWidth = $('.chapters-header> th:nth-child('+index+')').innerWidth();
  //$('.chapters-header> th:nth-child('+index+')').addClass('chosenPart')
  var height = $('.data-table').innerHeight() - $('.tomes-header th:first').innerHeight();


  var rowBottom = $('.data-table tbody tr:last-child > td:nth-child('+index+')').offset();
  var topBottom = rowBottom.top;

  $('#divOverlay').offset({top:topTop - 3 ,left:left - 2});
  $('#divOverlay').height(height);
  $('#divOverlay').width(oneWidth);
  $('#divOverlay').css('visibility','visible');
  $('#divOverlay').delay(200).slideDown('fast');

  if(indicator=='ALL'){

  }
  else{
    url =route+'&indicator='+indicator; 
    $scope.inspectorStats.indicatorCode = indicator;
 $('.td_issue[data-path ="'+url+'"]').addClass('chosenPart');
 
  }

 

if(indicator!='ALL'){ 
  url =url+'&indicator='+indicator; 

  element = resolveRoute(url);
 
  filterTasks(element, indicator, task);
}

else{
  filterTasks(element, 'ALL', task);
  angular.forEach(element.parts, function(part){
  filterTasks(part, 'ALL',task);
  
  });


}



    $scope.inspectorDisplaySrc='component'
 
}


var insertLocalTask = function(route, task){
  var element = resolveRoute(route);

  element.todos.unshift(task);


  $scope.context.Tasks =computeAllTasks();


  var rt = route+'&taskid='+task._id;
  if(task.classof!=='ALL') rt = rt + '&indicator='+task.classof
  loadURL(rt);
 
}
var updateLocalTasks = function(route, data){
  var element = resolveRoute(route);
  element.todos = data;
  loadContext();

}

var deleteTaskLocally = function(index){
  $scope.context.Tasks.splice(index,1)
}

var editTaskLocally = function(index, task){
  $scope.context.Tasks[index] = task;
  $scope.context.Tasks[index].done=false;
}

 var about = function () {
        ngDialog.open({ template: 'courses/views/about.html', className: 'ngdialog-theme-default', width: '75%',
        controller: ['$scope', '$rootScope',  '$stateParams', '$location', '$http', 
        function($scope, $rootScope,  $stateParams, $location, $http) {
        $scope.result = 'hidden'
    $scope.resultMessage;
    $scope.feedbackFormData; //feddbackFormData is an object holding the name, email, subject, and message
    $scope.submitButtonDisabled = false;
    $scope.submitted = false; //used so that form errors are shown only after the form has been submitted
    


    }]
      });
       

      ///////////// LOG ////////////
      saveLog({
            'name':'about'
          });
      //////////////////////////////
    };
    $scope.about=function(){about()}

////////////// BEGIN SCOPE
$scope.nztour = {
    config: {
        mask: {
            visible: true, // Shows the element mask
            clickThrough: false, // Allows the user to interact with elements beneath the mask
            clickExit: false, // Exit the tour when the user clicks on the mask
            scrollThrough: true, // Allows the user to scroll while hovered over the mask
            color: 'rgba(0,0,0,.7)' // The mask color
        },
        container: 'body', // The container to mask
        scrollBox: 'body', // The container to scroll when searching for elements
        placementPriority: ['top', 'right', 'bottom','left'],
        previousText: 'Précédent',
        nextText: 'Suivant',
        finishText: 'Fermer',
        animationDuration: 400, // Animation Duration for the box and mask
        disableInteraction: true, // Disable interaction with the highlighted elements
        dark: false // Dark mode (Works great with `mask.visible = false`)
    },
    steps: [
       {
            target:'.navbar-fixed-top',
            content: "<img width:30 src='/courses/assets/img/logo.png'  />"+
            "<span><b>Bienvenue sur la visite guidée du tableau de bord CoReaDa.</b>"+
            "<br/>** Cette visite vous permettra de découvrir les éléments principaux de l'interface. "+
            "<br/>** Les boutons suivant/précédent permettent de naviguer dans la présentation. Vous pouvez utiliser aussi les flèches de direction de votre clavier."+
            "<br/>** Vous pouvez arrêter cette visite à tout moment en la fermant ou en appuyant sur le bouton <i>Echap</i> de votre clavier.</span>"
        },
        {
            target:'#data-table',
            content: "<h4>Zone Table de données du cours</h4>"+
            "<span>Cette table présente en en-tête la structure du cours (colonnes) et les indicateurs associés (lignes). Les cellules intérieures colorées correspondent aux valeurs des différents indicateurs (carte de chaleur). Les problèmes potentiels détectés sont indiqués à l’aide du symbole  </span>"+
             "<img  width='25'  src='/courses/assets/img/fact.png'>"
        },
        {
            target: '.inspector-content',
            content: "<h4>Inspecteur</h4>"+
            "<span>Présente les indicateurs calculés sous deux angles: problèmes potentiels et statistiques. </span>"
        },
        {
            target: '#task-panel',
            content: "<h4>Tâches</h4>"+
            "<span>Permet de planifier des actions sur l'élément sélectionné depuis sa zone d'édition. </span>"
        },
        
    /*    {
            target:'#granuleSwitchTH',
            content: "<h4><em>Changement Granule</em></h4>"+
            "Permet de sélectionner le niveau de granularité sur lequel les indicateurs sont calculés :"+
            "<ul><li><b>Chapitre</b> : les indicateurs sont calculés par rapport aux chapitres <li> <b>Section</b>: les indicateurs sont calculés par rapport aux sections</ul>"
        },*/
        {
            target:'.inspectorChosenPart',
            content: "<h4>Problème potentiel détecté</h4>"+
            "<span>Ce symbole indique qu'un problème potentiel pour l’indicateur (en-tête de ligne) a été détecté pour l'élément (en-tête de colonne).</span>"
        },
        {
            target: '#single-button',
            content: "<h4>Configuration d'affichage</h4>"+
            "<span>Ce menu permet de : 1/ sélectionner le seuil de détection des problèmes potentiels : afficher uniquement les principaux problèmes ou avoir un affichage plus exhaustif; 2/ sélectionner les indicateurs à afficher : tous les indicateurs ou les principaux indicateurs.</span>"
        }
        ,
       
        
        {
            target: '#factsTab',
            content: " <h4>Onglet <em>Problèmes</em> </h4> "+
            "<span>Présente les problèmes potentiels détectés pour l'élément. </span>"
        },
        {
            target:'#fact-div',
            content: " <h4>Description de problèmes potentiels</h4>"+
            "<span>Affiche une description du problème sélectionné. Des suggestions pour le résoudre sont parfois proposées et peuvent être marquées comme tâches à faire.</span>"
        },
        {
            target:'#dropFactBtn',
            content: " <h4>Bouton <em>Ce n'est pas/plus un problème</em></h4>"+
            "<span>Ce bouton permet d’arrêter l'affichage de ce problème (soit le problème n'en est pas un (faux positif), soit des actions pour le résoudre ont déjà été entreprises).</span>"
        },
        {
            target:'#createFactTaskBtn',
            content: " <h4>Bouton <em>Créer une tâche</em></h4>"+            
            "<span>Ce bouton planifie une action permettant sa résolution dans la <b>Zone de Tâches</b>. Le système ajoute alors la suggestion comme action à réaliser, avec la possibilité de la modifier.</span>"
        },
        {
            target: '#factChartPanel',
            content: " <h4>Graphiques</h4>"+
            "<span>Présente les graphiques illustrant le problème ou la statistique sélectionnée sur le partie gauche de l'inspecteur. L'élément sélectionné est doté d'une bordure épaisse et colorée.</span>"
        },
        {
            target: '#statsTab',
            content: " <h4>Onglet <em>Statistiques</em></h4>"+
            "<span>Présente quelques statistiques sur l'élément sélectionné. </span>",
            before: function() {
                    var d = $q.defer(); 
                    $scope.tabSelect = 'stats';
                    d.resolve();
                    return d.promise;
                }
        },
        {
            target: '#titleBar',
            content: " <h4>Barre de titre</h4>"+
            "<span>Donne l'aroborescence de l'élément sélectionné avec possibilité de navigation</span>"
        },
        {
            target: '#gotoOC',
            content: " <h4>Bouton <em>Visiter sur OpenClassrooms</em></h4>"+
            "<span>Ce bouton permet d'ouvrir le site OpenClassrooms dans un nouvel onglet (ou une nouvelle fenêtre), sur la page du cours contenant l'élément concerné pour le voir dans son contexte </span>"
        },
        {
            target: '.componentInfo',
            content: " <h4>Une statistique</h4>"+
            "<span>Sur l'onglet <em>Statistiques</em>, chaque ligne représente une statistique relative à un indicateur pour l'élément sélectionné</span>"
        },
        {
            target: '.factImg:visible',
            content: " <h4>Cette icône accompagnant la statistique indique qu'un problème potentiel a été détecté. Cliquer sur licône permet de voir ce problème</h4>"+
            "<span> .</span>"
        },
        {
            target: '#chartPanel',
            content: " <h4>Graphiques</h4>"+
            "<span>Présente les graphiques illustrant les valeurs de la statistique sélectionnée.</span>"
        },

        
         
        {
            target: '#tasks-table',
            content: " <h4>Liste de <em>Tâches</em></h4>"+
            "<span>Les tâches planifiées sont affichées sur cette table. Un groupe de boutons permet de (gauche à droite)</span><br/>"+
            "<ul>"+
            "<li><span class='glyphicon glyphicon-pencil'></span> Modifier l'action planifiée"+
            "<li><span class='glyphicon glyphicon-ok'></span> Marquer l'action comme étant faite"+
            "<li><span class='glyphicon glyphicon-trash'></span> Supprimer l'action"+
            "</ul>"
        },
        {
            target: '#contact_us',
            content:"<em>La visite guidée est terminée. Merci de l'avoir suivie !</em> <br> <strong>N'hésitez pas à nous <a href='mailto:coreada.project@gmail.com' title='Cliquer ici pour nous envoyer un mail'>contacter</a>.</strong>"+
             "<img width:30 src='/courses/assets/img/logo.png'  />"
        }
       
        ],
};

$scope.startGuidedTour = function(){
    //goHome(); 
    setTimeout(function() {     
    selectTab('facts'); 
    $scope.tabSelect = 'facts';
     $scope.$apply();
     // $scope.launchGuidedTour();
     nzTour.start($scope.nztour)
    .then(function() {
        console.log('Tour Finished!');
    })
    .catch(function() {
        console.log('Tour Aborted!')
    });
  }, 500);
    
    
        ///////////// LOG ////////////
      saveLog({
            'name':'startTour'
          });
      //////////////////////////////
    
 }

    /******************END TOUR****************************/
$scope.transitionsDlg = function(type){
  
  if(type=='provenance_not_linear') $scope.transitionDisplay = 'Provenance'
    else $scope.transitionDisplay = 'Destination'

ngDialog.open({ template: 'courses/views/transitions.html', className: 'ngdialog-theme-default', width: '90%', scope:$scope});

}
$scope.signalFact = function(){

        ngDialog.open({ template: 'courses/views/facts-signal.html', className: 'ngdialog-theme-default', width: '50%',
        controller: ['$scope', '$rootScope',  '$stateParams', '$location', '$http', 
        function($scope, $rootScope,  $stateParams, $location, $http) {
        
    $scope.textarea_text="(Votre description)";

    $scope.sendFeedback = function(facteval) {

        $scope.submitted = true;
        $scope.submitButtonDisabled = true;
        var feedback ={
          'inputName':'author',
          'inputEmail':'author@author.com',
          'inputSubject':'new fact',
          'inputMessage':$scope.textarea_text
        }

        
          $http.post('/api/feedback',{'feedback':feedback})
          .success(function(data){
                    $scope.submitButtonDisabled = true;
                    $scope.resultMessage = data.message;
                    $scope.result='bg-success';
               swal({   title: "Merci!",   
            text: "Nous avons bien reçu votre suggestion. Merci.", 
             animation: "slide-from-top",
             type:"info"  ,
            timer: 1500,   showConfirmButton: false });
            })
          .error(function(data) {
              swal("Oops", "Une erreur interne du serveur est survenue. Le message n'a pas probablement pas pu être envoyé", "error");
              $scope.submitButtonDisabled = false;
                    $scope.resultMessage = data.message;
                    $scope.result='bg-danger';
            }); 
            ngDialog.closeAll(); 
            
        
    }

    }]
      });

      ///////////// LOG ////////////
      saveLog({
            'name':'sendFeedback'
          });
      //////////////////////////////
}






/////// Sendmail from the menu
 $scope.sendMail = function () {
        ngDialog.open({ template: 'courses/views/feedback.html', className: 'ngdialog-theme-default', width: '70%',
        controller: ['$scope', '$rootScope',  '$stateParams', '$location', '$http', 
        function($scope, $rootScope,  $stateParams, $location, $http) {
        $scope.result = 'hidden'
    $scope.resultMessage;
    $scope.feedbackFormData; //feddbackFormData is an object holding the name, email, subject, and message
    $scope.submitButtonDisabled = false;
    $scope.submitted = false; //used so that form errors are shown only after the form has been submitted
    
    $scope.sendFeedback = function(contactform) {
        $scope.submitted = true;
        $scope.submitButtonDisabled = true;
       
        if (contactform.$valid) {
          $http.post('/api/feedback',{'feedback':$scope.feedbackFormData})
          .success(function(data){
                    $scope.submitButtonDisabled = true;
                    $scope.resultMessage = data.message;
                    $scope.result='bg-success';
                     ngDialog.closeAll(); 
               swal({   title: "Merci!",   
            text: "Nous avons bien reçu votre message. Merci.", 
             animation: "slide-from-top",
             type:"info"  ,
            timer: 1500,   showConfirmButton: false });
            })
          .error(function(data) {
              swal("Oops", "Une erreur interne du serveur est survenue. Le message n'a peut-être pas pu être envoyé", "error");
              $scope.submitButtonDisabled = false;
                    $scope.resultMessage = data.message;
                    $scope.result='bg-danger';
                     ngDialog.closeAll(); 
            });  
            
        } else {
            $scope.submitButtonDisabled = false;
            $scope.resultMessage = 'Failed :( Please fill out all the fields.';
            $scope.result='bg-danger';
             ngDialog.closeAll(); 
        }
    }

    }]
      });
       

      ///////////// LOG ////////////
      saveLog({
            'name':'sendmail'
          });
      //////////////////////////////
    };
 $scope.itemsPerPage = 1;
 
 $scope.$watch('currentFact', function(newValue, oldValue) { 
  if($scope.tabSelect != 'facts') return;

 if(typeof $scope.inspectorFacts=='undefined') return;
 if($scope.inspectorFacts.Facts.length>0){

    var fact = $scope.inspectorFacts.Facts[newValue];
    $(".fact[data-fact-id='"+fact._id+"']").parent().addClass('inspectorChosenPart').fadeIn(100).fadeOut(100).fadeIn(200).focus().select();
    $scope.inspectorFacts.id = fact.partId;
    $scope.inspectorFacts.indicatorCode = fact.issueCode;
    $scope.currentElement.id = fact.partId;


setTimeout(function() {
  $(".fact[data-fact-id='"+fact._id+"']").parent().addClass('inspectorChosenPart').fadeIn(100).fadeOut(100).fadeIn(200).focus().select();
  $scope.$apply();
  }, 0);
  }
 
});

 

 

  $scope.prevPage = function() {
  if ($scope.currentFact > 0){
      $scope.setPage($scope.currentFact-1)
    }
  };

  $scope.DisablePrevPage = function() {
    return $scope.currentFact === 0 ? "disabled" : "enabled-page";
  };

  $scope.pageCount = function() {
   if(typeof $scope.inspectorFacts.Facts != 'undefined')
    return Math.ceil($scope.inspectorFacts.Facts.length/$scope.itemsPerPage)-1;
  };

  $scope.nextPage = function() {
    if ($scope.currentFact < $scope.pageCount()){
      
      $scope.setPage($scope.currentFact + 1)
    }
  };

  $scope.DisableNextPage = function() {
    return $scope.currentFact === $scope.pageCount() ? "disabled" : "enabled-page";
  };



  $scope.setPage = function(n) {
    
  $scope.currentFact = n;
  var components = parseURL(window.location.hash)
  if(components == null)    
      loadURL($scope.inspectorFacts.Facts[n].route);
    else
 if(components.hasOwnProperty('factid')) 
    if(components.factid != $scope.inspectorFacts.Facts[n]._id)
      loadURL($scope.inspectorFacts.Facts[n].route);

     window.setTimeout(function() {
        resetPath();
         $(".fact[data-fact-id='"+$scope.inspectorFacts.Facts[$scope.currentFact]._id+"']").parent()
         .addClass('inspectorChosenPart').fadeIn(100).fadeOut(100).fadeIn(200).focus().select();
      }, 0);
       
  };


  $scope.d3opts = [];
 
  $scope.myBrowsers = [ "GC", "AS" ];

  $(window).unbind('hashchange');


  $scope.observedElt ={};

     //$('table').hide();
     
     $scope.inspectorDisplaySrc='course';
     $scope.indicatorInspectorShow = 'course';
     $scope.course ={};

     $scope.tableData ={};
     
      $scope.courseParts =[];
      $scope.courseChapters =[];
      $scope.courseFacts =[];
      
      $scope.context = {};

      $scope.formData ='';
      $scope.textBtnForm ='';
      $scope.indicatorsSelectionModel= ['interest','Actions_tx','readers_tx','speed','rereads_tx','norecovery_tx','rereads_seq_tx','rereads_dec_tx','resume_past','resume_future','rupture_tx','reading_not_linear',
'provenance_not_linear','provenance_past','provenance_future','destination_not_linear','destination_past','destination_future'];
 
      $scope.chartType = $scope.indicatorsSelectionModel[0];
      $scope.globalChartSelector = $scope.indicatorsSelectionModel[0];
      $scope.elementTypeSelector = 'part';
      $scope.sectionsAvailable = false;
      $scope.sectionDisplay = false;
      
      $scope.taskPanelTitle = "Tâches";
      
      $scope.studiedPart = '';
//      $scope.context.otherFacts=[];
      $scope.inspectorChart = false;
      $scope.tabSelect = "stats";
      $scope.currentFact = 0;  
      $scope.currentElement = {'id':0, route:'#', 'type':'course'};  
      $scope.allFactsDisplay=false;
      $scope.ChaptersFacts = [];
      $scope.SectionsFacts = [];
      $scope.inspectorFacts={'Facts':[], 'type':'tome', 'selectedFact':'0'};
      $scope.inspectorStats ={'Facts':[], 'part_id':null,'indicatorCode':$scope.indicatorsSelectionModel[0], 'type':'chapter'};
      $scope.courseDisplay = true;
      $scope.indicatorSelectorShow = false;
      $scope.allIndicatorSelectorShow = false;      



       $scope.inspector = {'type':'tome', 'selectedFact':{},'Data':[]}


      $scope.tab = 0;
  
  
  $scope.isActiveTab = function(tab){
    return $scope.tab === tab;
  };
 



$scope.indicatorsHeader = resetIndicators($scope.course.dospeed);
$scope.selectedIndicators=$scope.indicatorsHeader;


$scope.show_or_hideChildren = function(){
    $scope.allIndicatorSelectorShow=!$scope.allIndicatorSelectorShow;
    
angular.forEach($scope.indicatorsHeader, function(indicator) {      
    show_or_hideChildren(indicator,$scope.allIndicatorSelectorShow);
})
       goHome(); 
   inspectorCourseData('facts');
}

$scope.toggleChildren = function(parent){
 
   toggleChildren(parent);
   goHome(); 
   inspectorCourseData('facts');
}
$scope.isIndicatorVisible = function(indicator){

//console.log('Ind: '+indicator+' : '+$scope.indicatorsHeader.filter(function(i){ return i.code == indicator})[0].show)
//return false;
var ind = $scope.indicatorsHeader.filter(function(i){ return i.code == indicator});
if(ind.length>0)
  return(ind[0].show)
else 
  return false;

}


$scope.setSectionDisplay = function(value){ 
  $scope.sectionDisplay = value;
window.setTimeout(function() {
 
  if(value) {
         $scope.inspectorFacts.Facts = $scope.SectionsFacts;   
         $scope.inspectorStats.type='part';
  }
  else{
      $scope.inspectorFacts.Facts= $scope.ChaptersFacts;
      $scope.inspectorStats.type='chapter';
  }


  $scope.currentFact = 0;
  }, 0);
}

$scope.toggleSectionDisplay = function(){ 
  goHome();
  
    $scope.sectionDisplay =! $scope.sectionDisplay;

  if($scope.sectionDisplay) {
         $scope.inspectorFacts.Facts = $scope.SectionsFacts;   
         $scope.inspectorStats.type='part';
  }
  else{
      $scope.inspectorFacts.Facts= $scope.ChaptersFacts;
      $scope.inspectorStats.type='chapter';
  }


  $scope.currentFact = 0;
  
   ///////////// LOG ////////////
      saveLog({
            'name':'toggleSectionDisplay'
          });
      //////////////////////////////

}

$scope.popoverTransitions = function(id){
    swal({   title: "Chapitres lus avant ce chapitre!",   
            text: "Une nouvelle tâche a été ajoutée avec succès pour l'élément sélectionné.", 
             animation: "false",
              showConfirmButton: false });
}

$scope.allTransitions = function(id){
    
  var  transits = {'provenances':[],'destinations':[]};
  var vals = $scope.course.navigation.filter(function(value){ return ((value.x == id) )});
  angular.forEach(vals,function(v){   
        transits.provenances.push({'part':v.y, 'id':$scope.getPartById(v.y).id, 'value':v.provenance});
        transits.destinations.push({'part':v.y,'id':$scope.getPartById(v.y).id, 'value':v.destination});


  })
  transits.provenances = $filter('orderBy')(transits.provenances, 'value', true) 
  transits.destinations = $filter('orderBy')(transits.destinations, 'value', true) 
  return transits;
}

$scope.transitionValue = function(type,id1,id2){
  if(id1==id2) return '';
  val = $scope.course.navigation.filter(function(value){ return ((value.x == id1) & (value.y == id2))})[0]
  
  if(type=='Provenance')  
    return(d3.round(100*val.provenance,1))
  else
    return(d3.round(100*val.destination,1))
}
$scope.getPartByIndex = function(i){
  var found = false;
  var result = $scope.course
  if(i==0) return $scope.course;
  angular.forEach($scope.course.tomes, function(tome) { 

    if(tome.id==i) 
    {  result = tome;
        return result;}
    
    angular.forEach(tome.chapters, function(chapter) { 
      
      if(chapter.id==i) 
      {result = chapter;
          return result;}
    
      angular.forEach(chapter.parts, function(section) { 
        if(section.id==i) 
         { result = section;
                 return result;}
    
      })
    })
  });
  
  return result;
}
$scope.getPartById = function(id){
  var found = false;
  var result = $scope.course;
  angular.forEach($scope.course.tomes, function(tome) { 

    if(tome.part_id==id) 
    {  result = tome;
        return result;}
    
    angular.forEach(tome.chapters, function(chapter) { 
      
      if(chapter.part_id==id) 
      {result = chapter;
          return result;}
    
      angular.forEach(chapter.parts, function(section) { 
        if(section.part_id==id) 
         { result = section;
                 return result;}
    
      })
    })
  });
  
  return result;
}
$scope.getGraphTitle = function(code){return getGraphTitle(code)}

 

$scope.zoomGraph = function(){
   ngDialog.open({ template: 'courses/views/zoom-graph.html', className: 'ngdialog-theme-default', width: '90%', scope:$scope});
}

 

/*********** Prepare Global Transitions ********************/
/*********** Compute colours ********************/








$scope.triggerClick = function($event){ 

  var url = '#'+$($event.currentTarget).attr('data-path');
   ///////////// LOG ////////////
      saveLog({
            'name':'cellClick',
            'elementId':resolveRoute(url)._id,
            'params':[
             {'paramName':'url','paramValue':url}] 
          });
      //////////////////////////////
  
  loadURL(url); 
  
 }
 $scope.triggerFactClick = function($event){  
  var url = $($event.currentTarget).attr('data-path');
  ///////////// LOG ////////////
      saveLog({
            'name':'factClick',
            'elementId':resolveRoute(url)._id,
            'params':[
             {'paramName':'url','paramValue':url}, 
             {'paramName':'content','paramValue':_course.todos[0].todo}] 
          });
      //////////////////////////////
  loadURL(url); 
  
 }
 
$scope.hoverChapter = function(route){ 
  if(route==null) return;
  resetPath();
  setTimeout(function() {
  var rowTop = $('.chapter_index[data-path="'+route+'"]').offset();
  
  var topTop = rowTop.top;
  var left = rowTop.left;

  var oneWidth = $('.chapter_index[data-path="'+route+'"]').innerWidth();
  //$('.chapters-header> th:nth-child('+index+')').addClass('chosenPart')
  var height = $('.data-table').innerHeight() - $('.tomes-header th:first').innerHeight();


  $('#divHoverOverlay').offset({top:topTop - 3 ,left:left - 2});
  $('#divHoverOverlay').height(height);
  $('#divHoverOverlay').width(oneWidth);
  $('divHoverOverlay').css('visibility','visible');
  $('#divHoverOverlay').delay(200).slideDown('fast');

  //$(".gly-issue[parent-path='"+route+"']").addClass('fa fa-exclamation-circle');

  }, 0);
}

$scope.hoverSection = function(route){ 
;
  if(route==null) return;
  resetPath();
  setTimeout(function() {
  var rowTop = $('.part_index[data-path="'+route+'"]').offset();
  
  var topTop = rowTop.top;
  var left = rowTop.left;

  var oneWidth = $('.part_index[data-path="'+route+'"]').innerWidth();
  //$('.chapters-header> th:nth-child('+index+')').addClass('chosenPart')
  var height = $('.data-table').innerHeight() - $('.tomes-header th:first').innerHeight();


  $('#divHoverOverlay').offset({top:topTop - 3 ,left:left - 2});
  $('#divHoverOverlay').height(height);
  $('#divHoverOverlay').width(oneWidth);
  $('divHoverOverlay').css('visibility','visible');
  $('#divOverlay').delay(200).slideDown('fast');

  //$(".gly-issue[parent-path='"+route+"']").addClass('fa fa-exclamation-circle');

  }, 0);
}

$scope.clearEditingTask = function(){
  $scope.formData ='';return false;
}


$scope.createFactTask = function(){

  $scope.formData = $scope.inspectorFacts.Facts[$scope.currentFact].suggestion_title; 

  var fact = $scope.inspectorFacts.Facts[$scope.currentFact];
var element = resolveRoute(fact.route);


  $scope.context.route = element.route;

  window.setTimeout(function() {
           $("#taskEditor").trigger( "click" );
           $(".editable-input ").fadeIn(100).fadeOut(100).fadeIn(200).focus().select();
       }, 0);
}



$scope.createTask = function($event){
  $scope.formData =  "Nouvelle tâche ("+"Sec. "+$scope.studiedPart+")"; 
$('#taskInput').focus();  
var element = resolveRoute($($event.currentTarget).attr('href'));

  $scope.context.route = $($event.currentTarget).attr('href');
  
window.setTimeout(function() {
             $(".editable-input ").fadeIn(100).fadeOut(100).fadeIn(200).focus().select();
        }, 0);

}
$scope.saveLog = function(params){

}
$scope.addTask = function (data) {
  
  $scope.dataLoading = true;
      if (data != undefined) {

   var addedTask = data;          
   var route = $scope.context.route;
   var query = parseTask(route, addedTask); 
   
   
        
        addTask(query.route,query.todo)
        .success(function(data) {          
          insertLocalTask(route, data);
           $scope.formData = undefined;
           $scope.dataLoading = false;
            swal({   title: "Nouvelle tâche ajoutée!",   
            text: "Une nouvelle tâche a été ajoutée avec succès pour l'élément sélectionné.", 
             animation: "slide-from-top",
             type:"info"  ,
            timer: 1500,   showConfirmButton: false });
        })
        .error(function(data) {
        swal("Oops", "Une erreur interne du serveur est survenue. La tâche n'a pu être ajoutée", "error");
      });  
        $scope.dataLoading = false;     
        
      }    
      $scope.formData ='';return false;   
  }
$scope.editTask = function (route, todo, index) {   
  var task ={'todo':todo, 'updated':Date.now};
        editTask(parseTaskRequest(route), task)
        .success(function(data) {
          swal({   title: "Tâche modifiée!",   
            text: "La tâche a été modifiée avec succès.", 
             animation: "slide-from-top",
             type:"info"  ,
            timer: 1500,   showConfirmButton: false });
        });
  }

$scope.openEditableArea = function(status){

  $scope.editableAreaOpen = status;
//if(x==false) $scope.taskPanelTitle = "Tâches"
  //else $scope.taskPanelTitle = x;
}
$scope.markTaskDone = function (route, index) {
  $scope.context.Tasks[index].done=!$scope.context.Tasks[index].done;
  var txt = $scope.context.Tasks[index].done?"faite.":"non encore faite";

  $scope.context.Tasks[index].updated=Date.now;
        editTask(parseTaskRequest(route), $scope.context.Tasks[index])
        .success(function(data) {
          swal({   title: "Tâche marquée comme "+txt,  
             animation: "slide-from-top",
             type:"info"  ,
            timer: 2000,   showConfirmButton: false });
        });
}
$scope.deleteTask = function (route, index) {
swal({
      title: "Supprimer la tâche ?", 
      text: "Êtes vous sur de vouloir suppprimer cette tâche ?", 
      type: "warning",
      showCancelButton: true,
      closeOnConfirm: false,
      confirmButtonText: "Oui",
      cancelButtonText: "Non",
      confirmButtonColor: "#ec6c62"
    }, function() {
      
       deleteTask(parseTaskRequest(route))
        .success(function(data) {
     //     updateLocalTasks($scope.context.route, data)     ;
     deleteTaskLocally(index);
           swal({   title: "Tâche supprimée!",   
            text: "La tâche a été supprimée avec succès", 
             animation: "slide-from-top",
             type:"success"  ,
            timer: 1500,   showConfirmButton: false });
         
              })
      .error(function(data) {
        swal("Oops", "We couldn't connect to the server!", "error");
      });
    });


  }

$scope.dropFact = function () {
  var fact = $scope.inspectorFacts.Facts[$scope.currentFact];
swal({
      title: "Marquer le problème comme résolu ?", 
      text: "Êtes vous sur de vouloir marquer ce problème comme résolu et le supprimer des problèmes potentiels ?", 
      type: "warning",
      showCancelButton: true,
      closeOnConfirm: false,
      confirmButtonText: "Oui",
      cancelButtonText: "Non",
      confirmButtonColor: "#ec6c62"
    }, function() {
      
       //dropFact(parseTaskRequest(route))
        //.success(function(data) {
     var result = dropFactLocally( $scope.inspectorFacts.Facts[$scope.currentFact].route);

     updateMainFacts();
     
  
  if($scope.sectionDisplay){
    if($scope.allFactsDisplay){
      $scope.SectionsFacts = $scope.AllSectionsFacts;
    }
      else{
        $scope.SectionsFacts = $scope.MainSectionsFacts;
      }
    $scope.inspectorFacts.Facts = $scope.SectionsFacts;
  }
  else{
     if($scope.allFactsDisplay){
      $scope.ChaptersFacts = $scope.AllChaptersFacts;
     }
      else{
        $scope.ChaptersFacts = $scope.MainChaptersFacts;
      }
    $scope.inspectorFacts.Facts = $scope.ChaptersFacts;
  }
     
           swal({   title: "Problème marqué comme résolu!",   
            text: "Succès", 
             animation: "slide-from-top",
             type:"success"  ,
            timer: 1500,   showConfirmButton: false });
         
          /*    })
      .error(function(data) {
        swal("Oops", "We couldn't connect to the server!", "error");
      });*/

window.setTimeout(function() {
    
    //goHome(); 
    $scope.tableData = $scope.course; 
    loadURL(result);
    // $scope.inspectorFacts.Facts = null;    
      $scope.$apply()
  }, 0);
      
    });
}





/////////////////
$scope.find = function() {
      Courses.query(function(courses) {
        $scope.courses = courses;
      });
    };

$scope.findOne = function() {
   $scope.dataLoading = true;
  $scope.pageLoaded = false;
    

$('.editable-text').on('shown', function (e, editable) {
  if (arguments.length != 2) return
    if (!editable.input.$input.closest('.control-group').find('.editable-input >textarea').length > 0 || !editable.options.clear || editable.input.$input.closest('.control-group:has(".btn-clear")').length > 0) return
        editable.input.$input.closest('.control-group').find('.editable-buttons').append('<br><button class="btn btn-clear"><i class="icon-trash"></i></button>');
    });


    
/////////////: LET's GET THE COURSE  

Courses.get({
        courseId: $stateParams.courseId
      }).$promise.then(function(course) {


if (course){
  about();
  
  if(!course.dospeed)
    $scope.indicatorsSelectionModel = ['interest','Actions_tx','readers_tx','rereads_tx','norecovery_tx','rereads_seq_tx','rereads_dec_tx','resume_past','resume_future','rupture_tx','reading_not_linear',
'provenance_not_linear','provenance_past','provenance_future','destination_not_linear','destination_past','destination_future'];
$scope.$watch('tabSelect', function(newValue, oldValue) { return tabSelectHandler(newValue, oldValue)}  );/////////// END watch 'tabSelect'
$scope.$watch('indicatorsSelectionModel', function(newValue, oldValue) {   return indicatorsSelectionModelHandler(newValue, oldValue)}  ); /////////// END watch 'indicatorsSelectionModel'
$scope.toggleFactsDisplay = function(){
    $scope.allFactsDisplay = !$scope.allFactsDisplay
 
}
$scope.$watch('allFactsDisplay', function(newValue, oldValue) {  
  if(newValue == oldValue) return;

  var selected = $scope.indicatorsHeader.filter(function(value){ return value.show === true});
  

   $scope.selectedIndicators =  $.grep(selected, function(e){return ($.inArray(e.value, $scope.indicatorsSelectionModel)>-1)}); 
  updateMainFacts();
  
  $scope.currentFact = 0;
  
 if(newValue){
  $scope.ChaptersFacts = $scope.AllChaptersFacts; 
  

 }
 else{
    $scope.ChaptersFacts = $scope.MainChaptersFacts;  
    
  };

  //goHome(); 
   inspectorCourseData('facts');
   





 

});

$(window).bind('hashchange',function(e){   loadContext(); });  

     //////////// INIT VARS
        $scope.course = course;
        var a = $filter('date')(new Date($scope.course.ob_begin), 'dd-MM-yyyy' );
        $scope.course.ob_begin = a;
        a=$filter('date')(new Date($scope.course.ob_end), 'dd-MM-yyyy' );
        $scope.course.ob_end = a;
        completeCourseParts();

        $scope.chartType = $scope.indicatorsSelectionModel[0];
      //  $scope.selectedElement = course;
        

     
    
    $scope.tableData = $scope.course;
        $scope.context = {
              'type':'course',      
              'route':$scope.course._id,
              'id':0,
              '_id':$scope.course._id,
              'title':$scope.course.title,
              'Todos':$scope.course.todos,
              'taskText':'(nouvelle tâche)',
              'indicator':$scope.indicatorsSelectionModel[0],
              'statsURL':"#",
              'Tasks' : computeAllTasks(),
              'd3':ComputeGlobalVisuData(),
              'mainstats':$scope.course.mainstats
              
        };
          /**********LOG*********/
          //console.log(course.logs)
          /**********************/

/**********INIT FUNCTIONS*********/
    
    




goHome();

        
        
    if($('.course_title_top').length<1)
      $('.navbar-brand').after('<a role ="button" href ="#" ng-click ="goHome(); resetPath();" class ="course_title_top"> <span class ="glyphicon glyphicon-book" style="top:2.5px!important" ></span>  <em><b>'+$scope.course.title+'</b></em>  <i>(données du '+$scope.course.ob_begin +' au '+$scope.course.ob_end+')</i>  </a>   <span class="course_tour_top pull-right"  role="button"></span>');
   
   /////////////// LET's GO
 window.setTimeout(function() {
    
    
    $scope.dataLoading = false;
    $scope.pageLoaded = true;
      $('.tableScroller').scroll();
          if($('.course_title_top').length<1){
          
                $('.navbar-brand').after('<a role ="button" href ="#" ng-click ="goHome(); resetPath();" class ="course_title_top"> <span class ="glyphicon glyphicon-book" style="top:2.5px!important"></span>  <em><b>'+$scope.course.title+'</b></em>  <i>(données du '+$scope.course.ob_begin+' au '+$scope.course.ob_end+')</i>  </a>  <span class="course_tour_top pull-right"  role="button"></span>');
                }

      $scope.tabSelect = 'facts';
     $scope.$apply();
  }, 500);

 
}

    
      })
      .catch(function(err){

        swal("Oops", "", "error");
        swal({
      title: "OOps !", 
      text: "Une erreur interne du serveur est survenue. Le cours que vous essayez de visiter existe-t-il vraiment ? Vous allez être redirigé vers la page d'accueil CoReaDa", 
      type: "error",
      showCancelButton: false
    }, function() { 
      window.location.href = window.location.origin
    });
        //


});

      ///////////END GET

    };



  // end
  }
]);




app.run(function(editableOptions, editableThemes) {  
  editableOptions.theme = 'bs3';
  editableThemes['bs3'].submitTpl =  '<button type ="submit" class ="btn btn-info"><span></span></button><br/>',
  editableThemes['bs3'].cancelTpl =  '<button type ="button" class ="btn btn-warning" ng-click ="$form.$cancel()">'+
                     '<span></span>'

  editableThemes.bs3.inputClass = 'input-xs';
  editableThemes.bs3.buttonsClass = 'btn-xs';
});


app.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'http://srv*.assets.example.com/**',
    'https://openclassrooms.com/**',
    'https://user.oc-static.com/**'
  ]);

  // The blacklist overrides the whitelist so the open redirect here is blocked.
  $sceDelegateProvider.resourceUrlBlacklist([
    'http://myapp.example.com/clickThru**'
  ]);
});