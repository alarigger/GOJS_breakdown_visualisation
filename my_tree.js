
var $ = go.GraphObject.make;
var myDiagram =
$(go.Diagram, "myDiagramDiv",
{
    "undoManager.isEnabled": true,
    initialAutoScale: go.Diagram.UniformToFill,
    layout: $(go.ForceDirectedLayout)// specify a Diagram.layout that arranges trees
   // layout: $(go.ForceDirectedLayout)// specify a Diagram.layout that arranges trees
});

var asset_array = []
var shot_array = []
var episode_array = []
var model = []
var links = []

function parse_episode_list_from_shot_list(_shot_list){
    var episode_list = []
    for(var i = 0 ; i < _shot_list.length ; i++){
        var underscore_split = _shot_list[i].split("_")
        if(episode_list.indexOf(underscore_split[0])===-1){
            episode_list.push(underscore_split[0])
        }
    }
    return episode_list
}

function push_to_episode_array(_episode_name){
        var match = 0;
        for(var i = 0 ; i < episode_array.length ; i++){
            if(episode_array[i].key == _episode_name){
                match++;
                break;
            }
        }
        if(match==0){
            var episode_obj = {
                key : _episode_name,
                id: _episode_name,
                code: _episode_name,
                number_of_assets:0,
                category:"Episode"
            }
            episode_array.push(episode_obj )
            model.push(episode_obj)
        }
}

function push_episode_list_to_episode_array(_episode_list){
    for(var i = 0 ; i < _episode_list.length ; i++){
        push_to_episode_array(_episode_list[i])
    }
}

function push_to_shot_array(_shot_list){
    for(var i = 0 ; i < _shot_list.length ; i++){
        var match = 0;
        for(var j = 0 ; j < shot_array.length ; j++){
           if(shot_array[j].key ==_shot_list[i]){
            match++
               break;
                
           }
        }
        if(match==0){
            var shot_obj = {
                key : _shot_list[i],
                id:_shot_list[i],
                code:_shot_list[i],
                category:"Shot"
            }
            shot_array.push(shot_obj)
            model.push(shot_obj)
        }
    }
}
  


//"1646","pr_pelle","Prop","ep101_pl057, ep101_pl058, ep101_pl059, ep101_pl061, ep101_pl062, ep101_pl063, ep101_pl066, ep101_pl067, ep101_pl070, ep999_pl006","Billy",

function parse_objarray_from_asset_csv(_csv_string){
    //"1646","pr_pelle","Prop","ep101_pl057, ep101_pl058, ep101_pl059, ep101_pl061, ep101_pl062, ep101_pl063, ep101_pl066, ep101_pl067, ep101_pl070, ep999_pl006","Billy",
    //0  1  2  3       4  5   6  7                                                                 6    7  8
    split_line = _csv_string.split("\n");
    var obj_array = []
    for(var i = 0 ; i < split_line.length ; i++){
        var split_escape = split_line[i].split('"')
        var stringlist = split_escape[7]+""
        var shot_list = stringlist.split(",")
        var episode_list = parse_episode_list_from_shot_list(shot_list)
        var size = shot_list.length*episode_list.length
        
        var font_size = 20//shot_list.length/2 < 16 ? shot_list.length : shot_list.length/2
        var font_string = "bold "+font_size+"px sans-serif"

        var asset_obj = {
            key:split_escape[1],
            id:split_escape[1],
            code:split_escape[3],
            sg_asset_type:split_escape[5],
            shots:shot_list,
            number_of_shots:shot_list.length,
            number_of_episodes:episode_list.length,
            //shot_size:shot_list.length*episode_list.length,
            shot_size:shot_list.length,
            episode_size:episode_list.length,
            episodes:episode_list,
            dynamic_font:font_string,
            asset_description : split_escape[3]+"\n"+"shots : "+shot_list.length+"\n"+"episdoes : "+episode_list.length,
            category:"Asset"
        }

        var types = ["Character","Prop"]
        //if(asset_obj.sg_asset_type=="Prop"){
        if(types.indexOf(asset_obj.sg_asset_type)!=-1){
            push_episode_list_to_episode_array(asset_obj.episodes)
            model.push(asset_obj)
            asset_array.push(asset_obj)
        }

        
    }

    return obj_array;

} 

function get_episode_obj_by_code(_episode_code){
    for(var i = 0 ; i < episode_array.length ; i++){
        if(episode_array[i].code == _episode_code){
            return episode_array[i]
        }
    }
}

function push_asset_links(_asset_obj){
    for(var i = 0 ; i < _asset_obj.episodes.length ; i++){
        var new_link = {
            from:_asset_obj.key,
            to:_asset_obj.episodes[i] ,
            color: "orange" 
        }

        var episode = get_episode_obj_by_code(_asset_obj.episodes[i])
        episode.number_of_assets+=100
        console.log(episode.number_of_assets)

        links.push(new_link )
    }

}

function push_asset_links(_asset_obj){
    for(var i = 0 ; i < _asset_obj.episodes.length ; i++){
        var new_link = {
            from:_asset_obj.key,
            to:_asset_obj.episodes[i] ,
            color: "orange" 
        }

        var episode = get_episode_obj_by_code(_asset_obj.episodes[i])
        episode.number_of_assets+=10
        console.log(episode.number_of_assets)

        //links.push(new_link )
    }

}

function create_link_model(){
    for(var i = 0 ; i < asset_array.length ; i++){
        push_asset_links(asset_array[i]);
        
    }
}


var csv_string = ""
async function readText(event) {
    const file = event.target.files.item(0)
    const text = await file.text();
    parse_objarray_from_asset_csv(text)
    create_link_model()

    myDiagram.nodeTemplate = $(go.Node, "Spot",
        // the entire node will have a light-blue background


        /*$(go.TextBlock,"Default Text2",
            { margin: 2, stroke: "white", font: "bold 16px sans-serif" },
            // TextBlock.text is data bound to the "name" property of the model data
            new go.Binding("text", "number_of_episodes"),
            new go.Binding("font", "dynamic_font")
        ), */
   
    )
    myDiagram.nodeTemplateMap.add("Asset",
    $(go.Node, "Spot",
        { locationSpot: go.Spot.Center },
        $(go.Shape, "Circle",
            { width: 1, height: 1, fill: "#44CCFF", stroke: null },
            new go.Binding("height", "shot_size"),
            new go.Binding("width", "shot_size")
        ), 
        $(go.TextBlock,"Default Text",
            { margin: 2, stroke: "white", font: "bold 16px sans-serif" },
            new go.Binding("text", "asset_description"),
            new go.Binding("font", "dynamic_font")
        )
    ));
    myDiagram.nodeTemplateMap.add("Episode",
    $(go.Node, "Spot",
        { locationSpot: go.Spot.Center },
        $(go.Shape, "Circle",
            { width: 100, height: 100, fill: "#FFAA00", stroke: null },
            new go.Binding("height", "number_of_assets"),
            new go.Binding("width", "number_of_assets")
        ), 
        $(go.TextBlock,"Default Text",
            { margin: 2, stroke: "black", font: "bold 16px sans-serif" },
            new go.Binding("text", "code"),
        )
    ));

    /*function DemoForceDirectedLayout() {
        go.ForceDirectedLayout.call(this);
      }
      go.Diagram.inherit(DemoForceDirectedLayout, go.ForceDirectedLayout);
  
      // Override the makeNetwork method to also initialize
      // ForceDirectedVertex.isFixed from the corresponding Node.isSelected.
      DemoForceDirectedLayout.prototype.makeNetwork = function(coll) {
        // call base method for standard behavior
        var net = go.ForceDirectedLayout.prototype.makeNetwork.call(this, coll);
        net.vertexes.each(function(vertex) {
          var node = vertex.node;
          if (node !== null) vertex.isFixed = node.isSelected;
        });
        return net;
      };
      // end DemoForceDirectedLayout class*/

    myDiagram.model =new go.GraphLinksModel(model, links);
}

