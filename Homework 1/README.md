# Homework 1

## 1.0 Explore coordinates and color encodings (25 pnts)

Reference this file with line numbers in answering the following questions about effects of changing various lines: [Ex_01_0_HelloTriangle-1.html](https://github.com/Mikecamdo/ComputerGraphics/blob/main/Module%201/Examples/Ex_01_0_HelloTriangle-1.html)

**TO SUBMIT:** Provide answers as a pdf file upload or enter in a textbox. Please number your answers.

A) Line 25 is used to specify the color of the triangle.

&nbsp;&nbsp;&nbsp;&nbsp;i) How would you change this to display a BLUE triangle? (write the modified line of code as your answer)

&nbsp;&nbsp;&nbsp;&nbsp;ii) How would you change this to display a YELLOW triangle? (write the modified line of code as your answer)

&nbsp;&nbsp;&nbsp;&nbsp;iii) Is this line of code executed on the CPU or the GPU?

B) Line 154 is used to specify the color of the background.

&nbsp;&nbsp;&nbsp;&nbsp;i) How would you change this to display a BLACK background? (write the modified line of code as your answer)

&nbsp;&nbsp;&nbsp;&nbsp;ii) Change line 154 to display a GREEN background.  Verify this was successful THEN comment out line 157.  What happened?  How do you explain this?  (Uncomment line 157 before proceeding.)

C) Comment out line 143.  What happens? (Uncomment line 143 before proceeding.)

D) Line 148 includes a drawing primitive in gl.TRIANGLES.  Change this to gl.LINES. Now change this to gl.LINE_STRIP. Now change this it gl.LINE_LOOP.  Explain what you observe.

E)  What lines of this file are executed on the GPU? (Provide answer as line numbers)

F) Lines 122-127 specify the coordinates of the three vertices of the triangle. 

&nbsp;&nbsp;&nbsp;&nbsp;i. What are the coordinate ranges of both the X and Y axes that are visible on the screen. 

&nbsp;&nbsp;&nbsp;&nbsp;ii. What happens if one coordinate is outside these bounds?

## 1.1 Programming Homework Two Triangles (25 pnts)

Create a single graphics program to meet the following requirement:
- Display two triangles, each in a separate quadrant of the drawing canvas in your browser.
- Use at least three colors.   Do not use a white background.
- Make one a solid triangle. For interest, consider making one a wireframe triangle.

**TO SUBMIT:** Upload two files, follow naming conventions for the files.
- **CG_HW1_TwoTriangles_&lt;yourname>.html**, a single, self-contained html file.  No credit is granted if it does not run in my browser. You can assume my browser supports HTML5 and WebGL 2.0
- **CG_HW1_TwoTriangles_&lt;yourname>.png**, a screenshot of your program

**Example naming convention.**

**LastNameFirstWithCamelCaseAndNoSpaces. Do this for all code uploads.**
- **CG_HW1_TwoTriangles_AlfordGinger.html**
- **CG_HW1_TwoTriangles_AlfordGinger.png**

## 1.2  Programming Homework : Pizza Pie (25 pnts)

Create a simple 2D graphics shape to create a pizza with 6-12 slices with toppings.
- Use **polar coordinates** to specify vertices along the circumference of a circle centered at (0,0) in the XY-Plane. (Along the pizza crust)
- Use multiple calls (at least 3) to gl.drawArrays 
- Use gl.POINTS and two other  primitive types of your choosing
- Specify color attributes for each vertex. (You may use one buffer with offsets or multiple buffers)

**To SUBMIT:** Attach two files. Follow naming conventions.
- **CG_HW1_PizzaPie_&lt;yourname>.html** self-contained html file to create this.  No credit is granted if it does not run in my browser. You can assume my browser supports HTML5 and WebGL 2.0
- **CG_HW1_PizzaPie_&lt;yourname>.png**,  a representative screenshot

## 1.3 Programming Homework (25 pnts)

For this homework assignment, you are to modify an interactive graphics program to draw a rotating cube.

Download and run the following skeleton code to verify proper setup. If all is well, you should have an interactive program that demonstrates rotating a cube along the selected axis.

**DOWNLOAD** a folder with the html and js files: [3DViewer](https://github.com/Mikecamdo/ComputerGraphics/tree/main/Module%201/Examples/3DViewer)
- 3DViewer.html. (You'll find the shader code in this one and the path to the initshader.js file here.  Check the path to the Common folder here.) 
- 3DViewer.js (You'll find the vertex and color data and the WebGL API calls to download the attribute data and to issue a draw command in this. This should be the only file you need to modify.)
 
**DOWNLOAD** a folder with utilities we will use throughout the semester: [Common](https://github.com/Mikecamdo/ComputerGraphics/tree/main/Module%201/Examples/Common). For this, we only need one file. 
- initshaders.js (You'll find the code to compile and link your shaders here. We can now include this by convenient reference)

Unzip these into the same folder so that your source code files are in a folder at the same level as your Common source code folder and will be referenced by a relative path ../Common/xx.js. 

This is how I will set things up to grade your HW1 programs so
- Please do not make me edit your files paths to run your HW programs.  (POINTS OFF for that!)
- Please do NOT submit a Common folder with your HW submission. (POINTS OFF for that too!)

In lines 15 - 18 you'll find the coordinates of the 8 corners.

In lines 28 - 36 you'll find eight RGB colors defined.

In line 105, you'll see one call to gl.drawarrays using gl.LINES (change just this to gl.LINE_LOOP and observe)

You will need to modify these parts, along with other parameters in the WebGL API calls that correspond to your modifications, in order to draw a cube. 

You may choose one of the following...
- create a solid cube, with each of the 6 FACES a different solid color, or 
- create  a wireframe cube with solid-colored lines, using a different color for each of the 12 EDGES of the cube. You may choose any colors you like.
- HINT: You may duplicate data. Order of vertices matters.

**TO SUBMIT** Upload **three files** - your two code files and a representative screenshot. Do not zip them. 

Follow this naming convention. Use last name first name.  Do not use blanks in the name.
- **CG_HW1_Cube_&lt;yourname>.html**
- **CG_HW1_Cube_&lt;yourname>.js**
- **CG_HW1_Cube_&lt;yourname>.png**
