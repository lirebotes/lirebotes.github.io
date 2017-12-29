function show_tab(tab_name){
	Array.from(document.getElementById("page_content").children).map(child => {
		if(child.getAttribute('name') == tab_name){
			child.style.display = "block";
		}
		else{
			child.style.display = "none";
		}
	});
}


function display_next_child(holder_id){
	var children = Array.from(document.getElementById(holder_id).children);
	for(i=0; i<children.length; i++){
		var child = children[i];
		if(child.style.display == "block"){
			child.style.display = "none";
			children[(i+1)%children.length].style.display = "block";
			return;
		}
	}
}

// same as `display_next_child`, but we show the previous element, ie (i-1)
function display_previous_child(holder_id){
	var children = Array.from(document.getElementById(holder_id).children);
	for(i=0; i<children.length; i++){
		var child = children[i];
		if(child.style.display == "block"){
			child.style.display = "none";
			children[(i-1+children.length)%children.length].style.display = "block";
			return;
		}
	}
}