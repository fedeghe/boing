(function (){

    var TO_RADIANS = Math.PI/180; 

    LIB.canvas = {

        drawRotatedImage : function (ctx, image, x, y, angle, size) { 
         
            // save the current co-ordinate system 
            // before we screw with it
            ctx.save(); 
         
            // move to the middle of where we want to draw our image
            ctx.translate(x + image.height/2, y + image.height/2);
         
            // rotate around that point, converting our 
            // angle from degrees to radians 
            ctx.rotate(angle * TO_RADIANS);
         
            // draw it up and to the left by half the width
            // and height of the image 
            ctx.drawImage(image, -(image.width/2), -(image.height/2), size, size);
         
            // and restore the co-ords to how they were when we began
            ctx.restore(); 
        }
    };

})();