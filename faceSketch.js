
const puzzler_names = ['Emi', 'Herm', 'Josh', 'Kath', "Steph"]



document.addEventListener('DOMContentLoaded', () => {
    showFaces();
});

function showFaces(){
    console.log('showinfcaces')
    let faceElements = document.querySelectorAll('.face');
    console.log("FACE ELEMENTS", faceElements)
    faceElements.forEach(faceElement => {
        let name = ''
        for(const class_str of faceElement.classList){
            if(class_str.includes('face-')){
                name = class_str.split('-')[1]
            }
        }
        
        if(puzzler_names.includes(name)){
            new p5((p) => sketchFace(p, name, faceElement));
        }
    
    });

}


function sketchFace(p, name, parentDiv){
    let img;
    let face_size = 150
    let padding = 30
    p.preload = function () {
        img =  p.loadImage(`./faces/${name}.png`);
    };
    p.setup = function () {
        const rect = parentDiv.getBoundingClientRect();
        let width = rect.width;
        let height = rect.height;
        width = p.min(width,height)
        height = width
        console.log("width, height", name, width, height,rect)
        padding = width /10
        face_size = width - padding*2

        const canvas = p.createCanvas(width, height);
        canvas.parent(parentDiv);
      };
    p.draw = function () {
        p.clear();
        drawFace(p, img, face_size, padding)
    };

}


function drawFace(p,img, face_size, padding){
    
    let rotationSpeed = 0.05; 
    let angle = 0;

    const aspect  = img.width/img.height
    const img_width = p.min(face_size, Math.floor(img.width/img.height*face_size))
    let border_size = p.map(p.sin(p.frameCount*rotationSpeed), -1,1,.1,.3)

    p.noStroke()
    angle = p.sin(p.frameCount * rotationSpeed) * 20;
    
    const centerX = (face_size+padding*2) / 2
    const centerY = (face_size+padding*2)/aspect/2

    p.push();
    p.translate(centerX, centerY);
    p.rotate(p.radians(angle));
    

    p.translate(-centerX, -centerY);
    p.image(img,
        padding+img_width*border_size/2,
        padding+img_width*border_size/2,
        (img_width*(1-border_size)), 
        img_width*(1-border_size)/aspect)
    p.pop();

}