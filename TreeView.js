// *******************************************************************
// TreeView
// Author: Christopher Santos
//
// jQuery dependent. Displays a navigable tree structure of JSON file.
// *******************************************************************

function TreeView(){

    // *****************************************
    // *    TREE & NODE RENDERING FUNCTIONS    *
    // *****************************************

    // createNode
    //
    // Creates a node (HTML 'li' tag) as a part of a list (parent 'ul').
    // label:       displayed text and ID
    // subnodes:    array of subnodes
    // selection:   DOM selection
    // classname:   CSS class name
    // color:       node color

    function createNode(label, subnodes, selection, classname, color){

        if(!color){
            color = "";
        }

        // append li tags
        $(selection).append(function(){
            $('<li />', {
                'class' : classname + " " + color,
                'id' : label, 
                text : label,
                appendTo : this
            });
        });

    }


    // render
    //
    // Renders HTML for parsed JSON array.
    // tree:    parsed JSON array
    // parent:  node to contain data

    function render(tree, parent, display){

        // create a node container
        if(display === false){
            $(parent).append(function(){
                $('<ul />', {
                    'style': "display:none",
                    appendTo: this
                });
            });
        }else{
            $(parent).append('<ul />');
        }

        // create nodes
        for(var i=0; i<tree.length; i++){

            // labels
            var nodelabel = tree[i].label;
            var subnodes = tree[i].nodes;
            var nodecolor = tree[i].color;
            var nodesubtree = tree[i].childrenURL;

            // create node
            createNode(nodelabel, subnodes, parent + " > ul", "node", nodecolor);
            
            // create subnodes if exists
            if(subnodes || nodesubtree){

                // add a toggle symbol
                $("#" + nodelabel).prepend(function(){
                    $('<img />', {
                        'src' : "arrow-right.png",
                        prependTo: this
                    });
                });

                // if an external source exists
                if(nodesubtree){
                    
                    // add JSON data location to HTML element to reference when requested
                    $("#" + nodelabel).attr("value", nodesubtree);

                }

                // if JSON subnode list exists
                if(subnodes){

                    // render a subtree within node
                    render(subnodes, "#" + nodelabel, false);

                }

            }

        }

        setFocus($(parent + " > ul > li:first"));  

    }


    // ************************
    // *    VIEW FUNCTIONS    *
    // ************************

    // setFocus
    //
    // Highlights a node to focus.
    // node:    node to set as focus

    function setFocus(node){

        // label current focus as previous focus
        $("li.focus").addClass("prevfocus");

        // remove current focus label from previous focus
        $("li.prevfocus").removeClass("focus");

        // add focus label to chosen node
        $(node).addClass("focus");

        // remove previous focus label
        $("li.prevfocus").removeClass("prevfocus");

    }

   
    // hideSubnodes
    //
    // Collapse subtree display.

    function hideSubnodes(){

        // set state to 'hide'
        $("li.focus > img").attr("src", "arrow-right.png");

        // hide subnode container
        $("li.focus > ul").css("display", "none");

        // if parent tree of node is the main node tree
        if(!$("div.widget > ul > li").hasClass("focus")){

            // shift focus to parent node
            setFocus($("li.focus").parent().parent());
        }
    }


    // showSubnodes
    //
    // Reveal subtree display.

    function showSubnodes(){

        // if node has external node data to load
        if($("li.focus").attr("value")){

            // load external node data
            load($("li.focus").attr("value"), "#" + $("li.focus").text());

            // remove link once external data is loaded
            $("li.focus").removeAttr("value");

        };

        // if node has subnodes
        if($("li.focus").children().length > 0){

            // set state to 'show'
            $("li.focus > img").attr("src", "arrow-down.png");

            // show subnode container
            $("li.focus").children("ul").css("display", "block");
            
            // change focus to first subnode
            setFocus($("li.focus > ul > li:first"));

        };

    }


    // ******************************
    // *    NAVIGATION FUNCTIONS    *
    // ******************************

    // e: key event
    $(document).keydown(function(e){

        switch(e.keyCode){

            // ENTER
            case 13:
                switch($("li.focus > ul").css("display")){

                    case "block":
                        hideSubnodes();
                    break;

                    case "none":
                    default:
                        showSubnodes();
                    break;

                }
            break;
        
            // UP ARROW
            case 38:
                // if the first subnode of the entire tree is not in focus
                if(!$("div.widget > ul > li:first-child").hasClass("focus")){

                    // if top node of subnode tree has focus
                    if($("ul ul > li:first-child").hasClass("focus")){

                        // shift focus to parent node
                        setFocus($("li.focus").parent().parent());

                    }else{

                        // else shift focus to previous subnode
                        setFocus($("li.focus").prev("li"));
                    }
                }
            break;

            // DOWN ARROW
            case 40:
                // if the last node or subnode of the entire tree is not in focus
                if(!$("ul > li:last-child").hasClass("focus")){

                    // if bottom node of subnode tree has focus
                    if($("ul > li:last-child").hasClass("focus")){

                        // shift focus to next parent node
                        setFocus($("li.focus").parent().parent().next());
                    }else{

                        // shift focus to next subnode
                        setFocus($("li.focus").next("li"));
                    }
                }
            break;

            // LEFT ARROW
            case 37:
                hideSubnodes();
            break;
            
            // RIGHT ARROW
            case 39:
                showSubnodes();
            break;
        }
    });


    // ************************
    // *    INITIALIZATION    *
    // ************************
    
    $(document).ready(function(){

        // // hide all subnode trees
        // $("ul ul").css("display", "none");
        
        // set click function for toggle buttons
        $("div.widget ul > li > img").click(function(){

            setFocus($(this).parent());

            switch($(this).attr("src")){

                case "arrow-right.png":
                    showSubnodes();
                break;

                case "arrow-down.png":
                    hideSubnodes();
                break;
            }

        });

    });


    // **********************
    // *    DATA LOADING    *
    // **********************

    // load
    // 
    // Loads specified JSON file for display via jQuery AJAX request.
    // link:    name of JSON file
    // location: location where data is inserted

    function load(link, location){

        // jQuery AJAX request
        $.get(link, function(data){
            render(data, location, true);       
        }, "json");

    }

    // external function load

    this.load = function(link){

        // add widget container
        $("body").append(function(){
            $('<div />', {
                'class' : "widget",
                appendTo : this
            });
        });

        load(link, "div.widget");

    }

}