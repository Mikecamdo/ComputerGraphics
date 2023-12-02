# Program 3: Render the Possibilities
## Overview
Discrete techniques in computer graphics generally refer to use the fragment shader to create a wide variety of visual effects by manipulating individual fragments. These techniques work at the pixel level and don't generally include vertex or geometry processing.

For this program, you may choose one of the following options to explore use of the fragment shader and clever use of internal GPU buffers to create interesting texture-based effects efficiently. Using a texture buffer to hold an image captured with a camera can lead to efficient image processing (computational imaging). Rendering to a texture buffer instead of a framebuffer allows you to merge multiple rendered frames into a single displayable frame to achieve effects like motion blur, shadows, and augmented reality effects.

**OPTION A:** Explore Advanced Image Processing Operations

**OPTION B:** Merge Graphics and Images with a Green Screen Effect

**OPTION C:** Extend your Program 2 with at least three applications of texture to your surfaces

<hr/>

**OPTION A:** Explore Image Processing Operations

**Overview:**

Traditional image processing, such as tone adjustment and filtering effects common on photo apps, is one important application of the fragment shader and textures. 

In this project you are to implement an interactive program to demonstrate several complex techniques using image as a texture.

Specifically, you will explore a technique that originated in the printing industry known as digital halftoning.

In this project you will also explore different types of geometric distortion. One type of interesting effect occurs with varying the texture sampling coordinates to create geometric distortion (or warping) of the image data.  This is in contrast to the geometric distortion that occurs when 3D geometry is projected onto a 2D plane. Your program will allow control 3D control of the mapping surface to allow observation of interesting effects by simply applying 3D transformations.

**REQUIREMENTS**
- (10) CAMERA or IMAGE FILE INPUT  
  - Read an RGB image or a video frame into a texture and display. 
  - Document CLEARLY any special instructions to access your data. Here are some examples
    - This might include an additional library that reads from the camera with clear usage notes and reference.
    - This might include setting up resources on a server and clearly documenting the proper path.
    - This might include setting up a local server with clear instructions for usage.
- (15) Incorporate at least two types of digital halftoning.
- (15) Incorporate at least two types of geometric distortion.
- (10) Provide a user interface slider to adjust parameters for the geometric distortions to explore different distortions.
- (10) Use multiple program objects.

<hr/>

**OPTION B:** Merge Graphics and Images with a Green Screen Effect

**Overview:**

Special effects in the movie industry and augmented reality applications rely on merging images of virtual objects created using graphics with image from camera and video. The fragment shader is used to merge the two into a single image in the fragment shader.  Very often, there is a unique color in the foreground image that indicates it is background pixel and should be replaced with the corresponding pixel from a background image.  This value is known as a "chromakey."  We often simply call this a "green screen" technique.

In this project you are to implement an interactive program to demonstrate using a green screen technique. You will take one image from a camera or video feed and you will take the other image from a virtual scene rendered to texture.  You will combine the in the fragment shader to either (1) place a virtual object in a real scene or (2) place a real object in a virtual scene.

**REQUIREMENTS**
- (10) CAMERA or IMAGE FILE INPUT  
  - Read an RGB image or a video frame into a texture and display. 
  - Document CLEARLY any special instructions to access your data.  Here are some examples
    - This might include an additional library that reads from the camera with clear usage notes and reference.
    - This might include setting up resources on a server and clearly documenting the proper path.
    - This might include setting up a local server with clear instructions for usage.
- (15) Render a virtual scene to texture as a second image.
- (15) Combine the two images in a fragment shader.
- (10) Provide a user interface slider to adjust parameters for the combination to explore the best merge.
- (10) Use multiple program objects.

<hr/>

**OPTION C:** Add advanced texture effects to your Program 2 to include either

- (1) incorporating texture maps AND lighting effects on at least 2 surfaces OR
- (2) incorporating a reflection map to make one object appear shiny 

**REQUIREMENTS**
- (30)
  - Incorporate texture and phong shading on at least two objects using two different fragment shaders **OR**
  - Create an environment map and make one object shiny
- (30) Use multiple program objects and multiple texture units

<hr/>

## Submission Details: 3 Submission Items

1. **­Complete well-documented program (Ready for Demo)**
    - .html and .js file(s) in one folder level (this may include multiple files) each one should follow this naming convention:
      - **CG_F23_Program3x_&lt;LastName>&lt;FirstName>.html**
      - **CG_F23_Program3x_&lt;LastName>&lt;FirstName>.js**
      - If applicable, any additional files you write should be named with one of the following conventions:
        - **CG_F23_Program3x_&lt;LastName>&lt;FirstName>_&lt;optionalname>.js**
        - **CG_F23_&lt;LastName>&lt;FirstName>_&lt;optionalname>.js**
        - (The last allows for easier reuse but the first easily identifies dependencies. You choose)
    - DO NOT include utilities in your submission.  ONLY use utilities available from the textbook in the Common folder but you MAY include utilities in the Common directory using this relative directory reference (../Common) as we did for homework.
    - Submit your executable project in a single compressed folder with all the source files that YOU wrote - included and referenced in current directory and ready to run.
2. **A representative screenshot in PNG format**
    - Please include this as a single PNG file included in the compressed folder with items in (1) and named:
      - **CG_F23_Program3x_&lt;LastName>&lt;FirstName>.png**
3. **­video (2-3 minutes) demonstrating logo and ways to view it, showing and explaining interesting code features.**
    - Please submit this as a SINGLE FILE UPLOAD to Canvas under a SEPARATE Canvas assignment created for this purpose
    - Please note this is a change in order to avoid size limitations.
    - This will be due midnight, the day of the demo. Don't forget.
    - Please know this may be shared with the class.  
    - Distance students may submit videos longer than 2-3 minutes in lieu of in person presentation. (suggested 5-8 minutes)
