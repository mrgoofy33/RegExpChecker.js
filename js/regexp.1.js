/* search test */
$(document).ready(function() {

    var encode = function(string)
    {
        return string
                .replace(/&/g,'&amp;')
                .replace(/</g,'&lt;')
                .replace(/>/g,'&gt;')
                .replace(/  /g,'&nbsp;&nbsp;')
                .replace(/\n/g,"<br />")
                .replace(/\t/g,"&nbsp;&nbsp;");
    }   

    var drawHighlightedText = function(text, matches)
    {
        var highlight = "";
        for( var i = 0; i < matches.length; i++ ) {
            var result = matches[i].result;
            var lastIndex = matches[i].lastIndex;
            
            // Capturing groups
            var matchString = result[0];
            var matchIndex = result.index;
            var lastStartPosition = startPosition;
            var startPosition = matchIndex;
            var endPosition = startPosition + matchString.length;
            var before = encode(text.slice(lastStartPosition,startPosition));
            
            var searchString = "^(.*?)";
            var replaceString = "$1";
            var k = 1;
            for(var j = 1; j < result.length; j++) {
                if(result[j] !== undefined) {
                    var resultRegex = encode(result[j].replace(/([.?\^${}\[\]()*+\/\\])/g,"\\$1"));
                    searchString += resultRegex + "(.*?)";
                    replaceString += "<span class=\"reg" + j + "\">" + encode(result[j]) + "</span>$" + (k+1);
                    k += 1;
                }
            }
            searchString += "$";
            matchString = encode(matchString).replace(new RegExp(searchString), replaceString);
            
            highlight += before + "<span class=\"match\">" + matchString + "</span>";
            startPosition = endPosition;
        }
        highlight += encode(text.slice(endPosition));
        if ( text == "" ){
            highlight = "<font color=\"red\" style=\"font-weight:bold; font-size:xx-large\">no Text.</font><br /><br /><br />";
        }
        $("#reg_text").html(highlight);
    }

    var drawReplaceText = function(text, matches, regex)
    {
        var regrep_val = $("#regrep").val();
        var highlight = "";
        for( var i = 0; i < matches.length; i++ ) {
            var result = matches[i].result;
            var matchString = result[0];
            var matchIndex = result.index;
            var lastStartPosition = startPosition;
            var startPosition = matchIndex;
            var endPosition = startPosition + matchString.length;
            var before = encode(text.slice(lastStartPosition,startPosition));
            matchString = matchString.replace(regex, regrep_val);
            highlight += before + "<span class=\"repword\">" + encode(matchString) + "</span>";
            startPosition = endPosition;
        }
        highlight += encode(text.slice(endPosition));
        if ( text == "" ){
            highlight = "<font color=\"red\" style=\"font-weight:bold; font-size:xx-large\">no Text.</font><br /><br /><br />";
        }
        $("#replace_text").html(highlight);
    }

    var drawMatchText = function(text, matches)
    {
        var matches = matches;
        var matchTable = "<table><thead><tr><td id=\"matchNumber\"></td><td>Text</td>";
        
        var columns = 0;
        for(var i = 0; i < matches.length ; i++ ) {
            if(columns < matches[i].result.length) {
                columns = matches[i].result.length;
            }
        }
    
        for(var i = 1; i < columns; i++) {
            matchTable += "<td class=\"td_no group-" + i + "\">$" + i + "</td>";
        }
        matchTable += "</tr></thead>";
    
        for( var i = 0; i < matches.length; i++ ) {
            var result = matches[i].result;
            matchTable += "<tr><td class=\"td_no\">" + (i + 1) + "</td>";
            matchTable += "<td title=\"" + encode(result[0]) + "\">" + encode(result[0].length > 20 ? result[0].substring(0,20) + '...' : result[0]) + "</td>";
            for(var j = 1; j < columns; j++) {
                if(result[j] !== undefined) {
                    matchTable += "<td class=\"group-" + j + "\" title=\"" + encode(result[j]) + "\">" + encode(result[j].length > 20 ? result[j].substring(0,20) + '...' : result[j]) + "</td>";
                } else {
                    matchTable += "<td class=\"group-" + j + "\">&nbsp;</td>";
                }
            }
            matchTable += "</tr>";
        }
        matchTable += "</table>";
        $("#reg_match").html(matchTable);
    }

    var regExpMatch = function()
    {
        var matches = new Array();
        var match;
        //var text = encodeURIComponent($("#text").val());
        var text = $("#text").val();
        var flg = '';
        $(".flg:checked").each( function(){
            flg += $(this).val();
        });
        var regexp_val = $("#regexp").val();
        var regex = new RegExp(regexp_val, flg);
        $("#reg_text").html(encode(text));
        if ( !$("#flg_g").is(":checked") ) {
            match = regex.exec(text);
            if ( match !== null ) {
                matches.push({result: match, lastIndex: match[0].length});
            }
        } else {
            while((match = regex.exec(text)) !== null) {
                if(match[0] === "") {
                    regex.lastIndex += 1;
                }
                else {
                    if ( match !== null ) {
                        matches.push({result: match, lastIndex: regex.lastIndex});
                    }
                }
            }
        }
        drawHighlightedText(text, matches);
        drawMatchText(text, matches);
        if ( $(".mode:checked").val() == 's' ) {
            drawReplaceText(text, matches, regex);
        }
    }

    $("#regexp").keyup(function(ev){
        regExpMatch();
    });

    $("#regrep").keyup(function(ev){
        regExpMatch();
    });

    $(".flg").click(function(ev){
        regExpMatch();
    });
    
    $(".mode").click(function(ev){
        regExpMatch();
        if ( $("#mode_s").is(":checked") ) {
            $("#rep_div").fadeIn();
            $("#replace_area").fadeIn();
        }
        else{
            $("#rep_div").fadeOut();
            $("#replace_area").fadeOut();
        }
    });

    $("#text").blur( function(ev){
        $("#input_area").hide();
        $("#result_area").fadeIn();
        regExpMatch();
    });

    $("#reg_text").click( function(ev){
        $("#result_area").hide();
        $("#input_area").fadeIn();
        $("#text").focus();
    });
    
    $('#main_area').sortable({
        items: '> .sort',
        placeholder:'hover',
        handle:'.sub_title',
        cursor: 'move'
    });
    
    $("input[name='mode']").val(["s"]);
    $("#input_area").hide();
    regExpMatch();

});

