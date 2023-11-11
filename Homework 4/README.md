# Image Data Method
To utilize the different textures in this program, I simply converted 3 images I found into RGBA values for each of their pixels.
I then stored these values inside JavaScript arrays (grassData, woodData, and concreteData) and used these arrays to apply the textures to the polygons.
I chose this method because I found it easier than setting up a URL resource; I also wanted the textures to be applied immediately when the program started, and I wanted the textures to be fixed (i.e., I didn't want the user to have to upload images to see any texture, and I also didn't want the user to be able to change the textures)

I have included the pictures that I used for textures in my submission for reference, but they are not necessary for the textures to function properly