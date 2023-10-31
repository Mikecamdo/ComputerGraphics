# Program 2: Lights! Camera! Action!
## Overview
For this program you will get to be creative in animating and lighting a 3D figure in a scene. You must provide animation of your figure and a means of viewing the entire scene from different 3D camera perspectives.

Articulated motion generally refers to an object that has connected component parts that move separately from one another but that are still related to each other as a whole.  Think of a robotic arm on an assembly line, a crane, a mounted camera on a production set, a skeleton.

Your submission will include a working program, additional documentation describing usage, code design and new features that you may choose to include as either a code element or interaction element.  Expect your program to be shared in a walk-around class gallery on demo day following the due date. AS WELL AS demoed from the instructor machine. Prepare to demo and explain briefly in class if asked.

**Requirements-you must incorporate each of these elements in some way.**

- **ARTICULATED FIGURE:** Must define figure from simple component 3D parts so that the figure has
  - (10 points) At least one part can move independently
  - (10 points) At least one part must move in conjunction with an attached part (think an elbow moves a hand, but the hand can move separately at the wrist)
  - **NOTE:** Your object **SHOULD NOT** be substantially the same as the provided examples for robotarm.hml or figure.html in Textbook Chapter 9.
  - **NOTE:** Your figure **DOES NOT NEED** to be sufficiently complex so that you need to write or copy a lot of code to implement a tree or stack, although this does provide for more interesting figures, better control and cleaner code. But you MUST fully understand and explain what code you choose use or adapt if you do that.
-  **MESH LANDSCAPE:**
  -  (5 points) Define a "landscape" as a mesh using a heightfield function defined on the XZ-plane.
  -  The mesh should NOT move with the object but the camera should be able to view it from different positions.
-  **LIGHTING:**
  -  (10 points) Define at least one positional or directional light in your scene that will provide visible diffuse or specular shading effects.
-  **CAMERA POSITIONING:**
  -  (10 points) Provide controls to change the viewing position (HINT: use the **lookAt** function)
-  **FUNCTIONALITY REQUIREMENTS and EXPECTATIONS:**
  -  (5 points) The entire object must move within the scene. (e.g. figure "walks" on mesh or crane moves while axes stay fixed). Object motion can be animated or controlled by user interaction.
  -  (5 points) Motion is controlled and reasonable - i.e. good master and management of current transformation matrices for model components
  -  (5 points) Specify a **projection** using **one of the three methods (e.g. ortho, frustum, perspective)** for specifying a veiwing volume in **MVnew.js**.  You can set the view volume to use the units that are most convenient for your scene.
-  **EXCEPTIONAL WORK:** (10 points) Incorporate some additional element. Here are examples:
  -  Provide a way to move the light. (e.g. concepts -a "sun" that moves across the sky. a "flashlight" that can be directed) (MEDIUM)
  -  Cast a shadow using projection matrices (HARD)
  -  Create an "environment" that exists at a very large scale so that the camera is inside the environment and the interior surfaces show.  (E.G. A very large cube or sphere) or a simpler version is that there is a "wall" as a background. (TRICKY)
  -  Change material properties of your object or mesh for different effects
  -  Include complex figures generate from external modeling tools ( from *.obj files)
  -  Include an articulated figure with greater than 5 joints.
