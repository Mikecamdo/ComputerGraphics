# Homework 2
## 2.1 Change That Color (30 points)

For this homework assignment, you are to create a simple interactive program to change the color of a primitive (either 2D or 3D)
- Draw any single primitive you wish.
- Use a uniform variable to change the color of that primitive in the fragment shader
- Use a drop-down menu to allow the user to select the color of the primitive.
- Optionally, you may also incorporate a way for a user to modify the background color

**Submission Instructions for programming homework**

Attach a single, zipped folder that includes two files.  Follow naming conventions.
- **CG_HW2_ChangeThatColor_<yourname>.html**, a single, self-contained html file. No credit is granted if it does not run in my browser. You can assume my browser supports HTML5 and WebGL 2.0
- **CG_HW2_ChangeThatColor_<yourname>.jpg (or png)**, a representative screenshot
 
## 2.2 Move That Point (30 points)

For this homework assignment, you are to create a simple animation by drawing a single point that moves on the screen according to a parametric equation.
- Use a uniform variable as input to the graphics shader to specify an offset in the x and y direction for the position of the point.
- Use a parametric equation inside the render loop to update the x and y offsets for each frame.
- Your parametric equation CAN NOT be a circle since you have that code.  You must find parametric equations that include paths that cross. (Google 2D Parametric equations to see some great ones.  Keep in mind you are viewing only a portion of the real xy-plane that extends from -1 to 1 in both directions.
- Choose a point size greater than 10.0
- Modify your program so that you can visualize the path. That is, do not clear the canvas between drawing frames. (HINT: By default, the browser will clear the canvas with each render call. You can change this behavior with this: { preserveDrawingBuffer: true} when you create the Canvas

**Submission Instructions for programming homework**

Attach a single, zipped folder that includes two files.  Follow naming conventions.
- **CG_HW2_MoveThatPoint_<yourname>.html**, a single, self-contained html file. No credit is granted if it does not run in my browser. You can assume my browser supports HTML5 and WebGL 2.0
- **CG_HW2_MoveThatPoint_<yourname>.jpg (or png)**, a representative screenshot
 
## 2.3 Tetrahedron Slider (40 points)
For this homework assignment, you are to create a single graphics program to meet the following requirement:
- Draw a tetrahedron. 
- Draw lines to show the 3 coordinate axes in world coordinates
- Use sliders to control moving the tetrahedron in the XZ-plane (HINT: use a uniform variable)
- Be sure the axes do not move with the tetrahedron!
- Include rotational control of the view that can be turned off. (HINT: 3D Viewer Template from HW 1)

**Submission Instructions for programming homework**

Create two files and upload a single zip folder that includes two files. Follow naming conventions for the files.
- **CG_HW2_Tetrahedron_<yourname>.html**, a single, self-contained html file. No credit is granted if it does not run in my browser. You can assume my browser supports HTML5 and WebGL 2.0
- **CG_HW2_Tetarahedron_<yourname>.jpg (or png)**, a screenshot of your program
