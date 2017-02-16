angular.module('starter.controllers', ['ionic'])

// npm install -g add-cors-to-couchdb

// Once installed enable the CORS by running the following command:

// ../couchDB/bin> couchdb

// add-cors-to-couchdb
//
// Couch Db should be running at port 5984. Try browsing http://localhost:5984/ .



.controller('HomeCtrl', ['$scope', 'pouchdb', '$ionicModal', function($scope, pouchdb, $ionicModal){
  var dbLocal = new PouchDB('dbname');
  var dbRemote = new PouchDB('http://localhost:5984/dbname');

  $scope.item = {};
  $scope.items=[];

  $scope.add = function(){
    var timeStamp = String(new Date().getTime());

    var item = {
        "_id": timeStamp,
        "expense": $scope.item.expense,
        "amount": $scope.item.amount
    };

    dbLocal.put(
      item
    ).then(function(response){
      $scope.items.push(item); //Add items to array
      $scope.closeModal();    //Closes the modal
    }).catch(function(err){
      console.log(err);
    });

    dbLocal.allDocs({
      include_docs: true
    }).then(function(result){
      // console.log('result is ', result.rows);
      for(var i=0; i<result.rows.length-1; i++){
        var obj = {
            "_id": result.rows[i].doc.id,
            "expense": result.rows[i].doc.expense,
            "amount": result.rows[i].doc.amount
        }
        $scope.items.push(obj);
        $scope.$apply();
      }
      console.log($scope.items);
      // clear the input boxes
      // $scope.item.expense = null;
      // $scope.item.amount = null;

        console.log('Successfully upated!');
        // console.log($scope.items);
      }).catch(function(err){
        console.log(err);
      });

    };

      // dbLocal.replicate.to(dbRemote,{live:true},function(err){
      //     console.log(err);
      //   });

      dbLocal.sync(dbRemote, {
          live: true,
          retry: true
          }).on('change', function (change) {
              console.log('yo, something changed!');
          }).on('paused', function (info) {
              console.log('replication was paused, usually because of a lost connection');
          }).on('active', function (info) {
              console.log('replication was resumed');
          }).on('error', function (err) {
              console.log('totally unhandled error, this should n0t happen)');
        });

      $ionicModal.fromTemplateUrl('my-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal){
        $scope.modal = modal;
      });
      $scope.openModal = function(){
        $scope.modal.show();
      };
      $scope.closeModal = function(){
        $scope.item.expense = null;
        $scope.item.amount = null;
        console.log('something!');
        $scope.modal.hide();
      };

      $scope.$on('$destroy', function(){
        $scope.modal.remove();
      });
}])

.factory('pouchdb', function(){

  return new PouchDB('myApp');
});
