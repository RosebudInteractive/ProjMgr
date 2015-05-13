$(function() {
    $( "#tabs" ).tabs();

    $(document).ajaxStart(function() {
        $("#qloader").show();
    }).ajaxStop(function() {
        $("#qloader").hide();
    });

    doAction(null, 'projects');
});

function doAction(btn, action, extraData) {
    if (btn) $(btn).attr('disabled', true);
    var data = {
        branchProject: $('#branchProject').val(),
        branchName: $('#branchName').val(),
        serverProject: $('#serverProject').val(),
        addProject: $('#addProject').val() ,
        addBranchName: $('#addBranchName').val() ,
        addUccelloName: $('#addUccelloName').val() ,
        addPortWeb: $('#addPortWeb').val() ,
        addPortWs: $('#addPortWs').val()
    };
    if (extraData)
        for (var attrname in extraData)
            data[attrname] = extraData[attrname];

    $.ajax({
        method: "POST",
        url: "/admin/"+action,
        data: data
    })
        .done(function( msg ) {
            //console.log(arguments);
            if (action == 'projects') {
                printProjects(msg);
            } else {
                if (!msg && msg == '') msg = 'Ok';
                $('#branchResponse').html('<p>'+msg+'</p>'+$('#branchResponse').html());
                //$('#branchResponse').html('<p>'+msg+'</p>');
                if (action == 'add' || action == 'delete')
                    doAction(null, 'projects');
            }
            if (btn) $(btn).attr('disabled', false);
        });
}

function printProjects(msg) {
    var projects = JSON.parse(msg);
    $('#currProjects').html('');
    $('#addPortWeb').html(' <option value="1340">1340</option> <option value="1341">1341</option> <option value="1342">1342</option> <option value="1343">1343</option> <option value="1344">1344</option> <option value="1345">1345</option> <option value="1346">1346</option> <option value="1347">1347</option> <option value="1348">1348</option> <option value="1349">1349</option>');
    $('#addPortWs').html(' <option value="8090">8090</option> <option value="8091">8091</option> <option value="8092">8092</option> <option value="8093">8093</option> <option value="8094">8094</option> <option value="8095">8095</option> <option value="8096">8096</option> <option value="8097">8097</option> <option value="8098">8098</option> <option value="8099">8099</option>');

    for(var i=0; i<projects.length; i++) {
        $('#addPortWeb').find('option[value='+projects[i].portWeb+']').remove();
        $('#addPortWs').find('option[value='+projects[i].portWs+']').remove();
        $('#currProjects').append('<p>'+projects[i].project+':'+projects[i].projectBranch+'/Uccello:'+projects[i].uccelloBranch+' <a href="http://projects.calypsoid.com:'+projects[i].portWeb+'" target="_blank">открыть</a>'+' <a href="#" onclick="if (confirm(\'Вы уверены?\')) doAction(null, \'delete\', {path:\''+projects[i].path+'\'}); return false;">удалить</a></p>');
    }
}