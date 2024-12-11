
const puzzler_names = ['Emi', 'Herm', 'Josh', 'Kath', "Steph"]



document.addEventListener('DOMContentLoaded', () => {
    showFaces();
});

function showFaces(){
    let faceElements = document.querySelectorAll('.face');
    faceElements.forEach(faceElement => {
        let name = ''
        for(const class_str of faceElement.classList){
            if(class_str.includes('face-')){
                name = class_str.split('-')[1]
            }
        }
        
        if(puzzler_names.includes(name)){
            if(!faceElement.classList.contains('displayed')){
                new p5((p) => sketchFace(p, name, faceElement));
                faceElement.classList.add('displayed');
            }
           
            
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
        padding = width /10
        face_size = width - padding*2

        const canvas = p.createCanvas(width, height);
        canvas.parent(parentDiv);
      };
    p.draw = function () {
        p.clear();
        img.loadPixels()
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
    // drawClothes(p, face_size/5, face_size/2,centerX, centerX+10)
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

function drawClothes(p, body_width, bodyHeight, centerX, centerY){
    let arm_y = centerY
    let arm_center = centerX-10
    let leg_length = bodyHeight/3
    //body
    p.fill("black")
    p.fill("white")
    p.rectMode(p.CORNER)
    
    let body_end = arm_y + bodyHeight
    body_end = arm_y + bodyHeight - leg_length
    const body = [
        [arm_center, arm_y],
        [arm_center+10, arm_y],
        [arm_center +body_width, body_end],
        [arm_center -body_width, body_end],
    ]
    noiseToShape(p,body)

    let leg_width = 4
    const leg1 = [
        [arm_center, body_end],
        [arm_center +leg_width, body_end],
        [arm_center +leg_width, body_end + leg_length],
        [arm_center, body_end+leg_length]
    ]
    const leg2 = [
        [arm_center + 5, body_end],
        [arm_center +leg_width + 5, body_end],
        [arm_center +leg_width+5, body_end + leg_length],
        [arm_center+5, body_end+leg_length]
    ]
    noiseToShape(p,leg1)
    noiseToShape(p,leg2)
  
};

function noiseToShape(p,points) {
    let timeStamp = p.frameCount;

    function y_line(point1, point2, input_x) {
      // y = mx + b
      let [x1, y1] = point1;
      let [x2, y2] = point2;
      let m = (y2 - y1) / (x2 - x1);
      let output_y = m * (input_x - x1) + y1;
      return output_y;
    }

    function add_points(points) {
      let newPoints = [];
      for (let i = 0; i < points.length; i++) {
        let nextPointIdx = (i + 1) % points.length;
        let nextPoint = points[nextPointIdx];
        let currPoint = points[i];
        let midpoint_x = (currPoint[0] + nextPoint[0]) / 2;
        let midpoint_y = y_line(currPoint, nextPoint, midpoint_x);
        
        newPoints.push(currPoint);
        newPoints.push([midpoint_x, midpoint_y]);
      }
      return newPoints;
    }

    const numIters = 2; // Number of interpolation iterations
    for (let i = 0; i < numIters; i++) {
      points = add_points(points);
    }

    const noiseZoom = 0.05;
    const noiseLevel = 10;
    const animationSpeed = 0.03;

    p.fill("black");
    p.beginShape();
    for (let i = 1; i < points.length - 1; i++) {
      let x = points[i][0];
      let y = points[i][1];
      let n = p.noise(x * noiseZoom, y * noiseZoom, timeStamp * animationSpeed) * noiseLevel;
      p.vertex(x + n, y + n);
    }
    p.endShape(p.CLOSE);
}




