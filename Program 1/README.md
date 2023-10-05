# Program 1: Put Yourself on a Pedestal
## Overview
For the program you will get to be creative in creating a 3D scene that reflects your own style.

You will be creating a personal 3D logo, using your initials to create a simple geometry "sculpture" that can be viewed from multiple directions as well as contains some form of animated variation.

Your submission will include a working program, additional documentation describing usage, code design and new features that you may choose to include as either a code element or interaction element.  Expect your program to be shared in a class gallery on the day following the due date.   Prepare to demo and explain briefly in class if asked.

## Functional Requirements
- (10 points) ­Must define **at least two 3D** objects (that is they must have width, height and depth) using **vertices in clip space**
  - You must define/code this yourself for this project. You may not use a modeling program to export points.
- (10 points) One object must be a pedestal.
  - The base of the pedestal must be on the **XZ-plane**
  - The pedestal must be a cylinder with a different radius at the top and the bottom.
  - Use polar coordinates to compute points along the base and top.
- (10 points)­ One object must be related to your initials and appear on the pedestal.
- (15 points) You must include three different interaction devices (e.g. slider, button, menu, keyboard, other)
  -  e.g. rotate your initials on the pedestal while the pedestal stays still, change the color of the pedestal with a menu choice, etc.
- (5 points) There must be some way for user to change the camera view in 3D.  (At least two rotations changes will be fine, similar to 3D viewer)
  - You may use basic code provided through Canvas.
- (10 points) Some exceptional feature
  - Add dynamic confetti effect that can be toggled on or
  - something else similarly interesting, surprising, fun or clever
  - Points will be commensurate with quality of implementation, uniqueness and difficulty.

## Submission Details: 3 Submission Items
1. ­**Complete well-documented program (Ready for Demo)**
- .html and .js file(s) in **one folder** level (this may include multiple files) each one should follow this naming convention:
  - **CG_F23_Program1_&lt;LastName>&lt;FirstName>.html**
  - **CG_F23_Program1_&lt;LastName>&lt;FirstName>.js**
  - If applicable, any additional files you write should be named with one of the following conventions
    - **CG_F23_Program1_&lt;LastName>&lt;FirstName>_&lt;optionalname>.js**
    - **CG_F23_&lt;LastName>&lt;FirstName>_&lt;optionalname>.js**
    - (The last allows for easier reuse but the first easily identifies dependencies.  You choose)
- DO NOT include utilities in your submission. ONLY use utilities available from the textbook in the Common folder but you MAY include utilities in the Common directory using this relative directory reference (../Common) as we did for homework.
- **Submit your executable project in a single compressed folder** with all the source files that YOU wrote - included and referenced in current directory and ready to run.
2. **­A representative screenshot in PNG format**
- Please include this as a single PNG file included in the compressed folder with items in (1) and named
  - **CG_F23_Program1_&lt;LastName>&lt;FirstName>.png**
3. **Video (2-3 minutes) demonstrating logo and ways to view it, showing and explaining interesting code features.** 
- Please submit this as a SINGLE FILE UPLOAD to Canvas under a SEPARATE Canvas assignment created for this purpose
- Please note this is a change in order to avoid size limitations.

## Grading Percentages
- Functional Requirements: **60%**
- Overall Quality: **10%**
  - Strong production values
  - Stable
  - Aesthetically pleasing
  - Usable
- Coding style: **10%**
  - Generally readable, well-structured
  - NO reliance on external utilities except the ones provided
  - Clean and uncluttered
  - Unused code substantially removed
  - Design choices
  - File submission correct
  - Reasonable performance tradeoff for number of vertices / visual quality
- Supplemental Documentation (Separate upload ): **10%**
  - Representative screen shot
  - Video demo 
  - Balanced content between use and code and techniques
  - Appropriate length
  - Explainable code (in class, in meeting, in video)
- Code discussion (in video, in class, in person ): **10%**
  - Explainable 
