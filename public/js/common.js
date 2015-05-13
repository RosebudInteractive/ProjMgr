$(function() {
    $( "#tabs" ).tabs();
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
                if (action == 'add')
                    doAction(null, 'projects');
            }
            if (btn) $(btn).attr('disabled', false);
        });
}

function printProjects(msg) {
    var projects = JSON.parse(msg);
    $('#currProjects').html('');
    for(var i=0; i<projects.length; i++) {
        $('#addPortWeb').find('option[value='+projects[i].portWeb+']').remove();
        $('#addPortWs').find('option[value='+projects[i].portWs+']').remove();
        $('#currProjects').append('<p>'+projects[i].project+':'+projects[i].projectBranch+'/Uccello:'+projects[i].uccelloBranch+' <a href="http://projects.calypsoid.com:'+projects[i].portWeb+'" target="_blank">открыть</a>'+' <a href="#" onclick="if (confirm(\'Вы уверены?\')) doAction(null, \'delete\', {path:\''+projects[i].path+'\'}); return false;">удалить</a></p>');
    }
}