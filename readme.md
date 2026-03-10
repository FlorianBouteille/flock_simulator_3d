# Flock Simulation

Try the simulation : https://swim-with-friends.pages.dev/

My attempt at trying to recreate the famous Craig Reynolds flock simulation from scratch in Three.js.

The goal is to simulate the behavior of a flock of animals such as birds or fish, that we will call boids. There are no global predeterminded path or pattern, nothing that tells boids they should go some place in order to form a flock. Instead, each individual boid choses its direction according to the position and orientation of its neighbors, just like an actual school of fish. 

Each boid moves according to three distinct forces. 
1- Cohesion : the boid determines the average position of its neighbors and tries to move towards it.
2- Separation : the boid tries to avoid colliding with its closest neighbors, the closer they are, the more it tries to move away.
3- Alignment : the boid determines the average orientation of its neighbors and matches his accordingly.

By carefully implementing these forces and weighing them, we try to get as close as possible to what looks like an actual school of fish. 

I also added a light random factor, to make it seem more natural, as well as current and placed a box in the center so that boids dont just fly off the screen. 

Also, a shark. And buttons. 

Enjoy ! 
