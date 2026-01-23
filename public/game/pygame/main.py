
import pygame
import asyncio
from os import listdir
from os.path import isfile, join, dirname, abspath

# Get the directory where this script is located
BASE_DIR = dirname(abspath(__file__))

pygame.init()


pygame.display.set_caption("Pixel Adventure")

WIDTH, HEIGHT = 1200 , 800
FPS = 120
PLAYER_VEL = 5
SCORE = 0
x_spawn = 32 
y_spawn = 400
offset_x = -200




window = pygame.display.set_mode(( WIDTH , HEIGHT ))


def flip(sprites):

    return [pygame.transform.flip( sprite , True , False ) for sprite in sprites]

def load_sprite_sheets( dir1 , dir2 , width , height , direction=False ):

    path = join( BASE_DIR, "assets" , dir1 , dir2 )
    images = [f for f in listdir( path ) if isfile( join( path , f ) )]

    all_sprites = {}

    for image in images:
        sprite_sheet = pygame.image.load( join( path , image ) ).convert_alpha()
        
        sprites = []

        for i in range( sprite_sheet.get_width() // width ):
            surface = pygame.Surface( ( width , height ) , pygame.SRCALPHA , 32)
            rect = pygame.Rect( i * width , 0 , width , height )
            surface.blit( sprite_sheet , ( 0, 0 ) , rect)
            sprites.append(pygame.transform.scale2x( surface ))

        if direction:
            all_sprites[image.replace(".png", "") + "_right"] = sprites
            all_sprites[image.replace(".png", "") + "_left"] = flip(sprites)
        else:
            all_sprites[image.replace(".png", "")] = sprites

    return all_sprites

def get_block(size):

    path = join(BASE_DIR, "assets", "Terrain", "Terrain.png")
    image = pygame.image.load(path).convert_alpha()
    surface = pygame.Surface((size , size), pygame.SRCALPHA, 32)
    rect = pygame.Rect(96 , 128 , size, size)#96,64
    surface.blit(image, (0 , 0), rect)

    return pygame.transform.scale2x(surface)



class Player(pygame.sprite.Sprite):
    COLOR = ( 255 , 0 , 0)
    GRAVITY = 1
    SPRITES = load_sprite_sheets( "MainCharacters" , "VirtualGuy" , 32 , 32 , True)
    ANIMATION_DELAY = 3

    def __init__(self , x , y , width , height):
        super().__init__()

        self.rect = pygame.Rect(x , y , width , height)
        self.x_vel = 0
        self.y_vel = 0
        self.mask = None
        self.direction = "left"
        self.animation_count = 0
        self.fall_count = 0
        self.jump_count = 0
        self.hit = False
        self.hit_count = 0
        self.hp = 100

    def jump(self):

        self.y_vel = -self.GRAVITY * 8
        self.animation_count = 0
        self.jump_count += 1

        if self.jump_count == 1:
            self.fall_count = 0

    def move(self , dx , dy):

        self.rect.x += dx
        self.rect.y += dy

    def make_hit(self):

        self.hit = True
        self.hp -= 10

    def move_left(self , vel):

        self.x_vel = -vel

        if self.direction != "left":
            self.direction = "left"
            self.animation_count = 0

    def move_right(self , vel):

        self.x_vel = vel

        if self.direction != "right":
            self.direction = "right"
            self.animation_count = 0

    def loop(self , fps):

        self.y_vel += min(1 , (self.fall_count / fps) * self.GRAVITY)
        self.move(self.x_vel , self.y_vel)

        if self.hit:
            self.hit_count += 1
        if self.hit_count > 40 :
            self.hit = False
            self.hit_count = 0

        self.fall_count += 1
        self.update_sprite()

    def landed(self):

        self.fall_count = 0
        self.y_vel = 0
        self.jump_count = 0

    def hit_head(self):

        self.count = 0
        self.y_vel *= -1

    def update_sprite(self):

        sprite_sheet = "idle"

        if self.hp < 1:
            global offset_x
            offset_x = -200
            self.rect.x = x_spawn
            self.rect.y = y_spawn 
            self.hp = 100

        if self.hit:
            sprite_sheet = "hit"
        elif self.y_vel < 0:
            if self.jump_count == 1:
                sprite_sheet = "jump"
            elif self.jump_count == 2:
                sprite_sheet = "double_jump"
        elif self.y_vel > self.GRAVITY * 2:
            sprite_sheet = "fall"
        elif self.x_vel != 0:
            sprite_sheet = "run"

        sprite_sheet_name = sprite_sheet + "_" + self.direction
        sprites = self.SPRITES[sprite_sheet_name]
        sprite_index = (self.animation_count //
                        self.ANIMATION_DELAY) % len(sprites)
        self.sprite = sprites[sprite_index]
        self.animation_count += 1
        self.update()

    def update(self):

        self.rect = self.sprite.get_rect( topleft=( self.rect.x , self.rect.y ) )
        self.mask = pygame.mask.from_surface(self.sprite)

    def draw(self, win, offset_x):

        win.blit(self.sprite , (self.rect.x - offset_x , self.rect.y))

class Object(pygame.sprite.Sprite):
    def __init__(self , x , y , width , height , name=None , direction="1"):
        super().__init__()

        self.rect = pygame.Rect(x , y , width , height)
        self.image = pygame.Surface((width , height), pygame.SRCALPHA)
        self.width = width
        self.height = height
        self.name = name
        self.direction =  direction

    def draw(self , win , offset_x):
        
        if self.direction == "1":
            win.blit(self.image, (self.rect.x - offset_x , self.rect.y))
        elif self.direction == "0":
            pygame.transform.flip(self.image , True , False)
            win.blit(self.image, (self.rect.x - offset_x , self.rect.y))

class Block(Object):
    def __init__(self , x , y , size):
        super().__init__(x , y , size , size)

        block = get_block(size)
        self.image.blit(block , (0 , 0))
        self.mask = pygame.mask.from_surface(self.image)
        self.animation_name = "Normal"

class Fire(Object):
    ANIMATION_DELAY = 3

    def __init__(self , x , y , width , height , side = 1):
        super().__init__(x , y , width , height , "fire")

        self.fire = load_sprite_sheets("Traps" , "Fire" , width , height)
        self.image = self.fire["off"][0]
        self.mask = pygame.mask.from_surface(self.image)
        self.animation_count = 0
        self.animation_name = "off"
        self.side = side

    def on(self):
        self.animation_name = "on"

    def off(self):
        self.animation_name = "off"

    def loop(self):

        sprites = self.fire[self.animation_name]
        sprite_index = (self.animation_count //self.ANIMATION_DELAY) % len(sprites)
        self.image = sprites[sprite_index]

        if self.side == 0 :
            self.image = pygame.transform.flip(self.image,False,True)
        
        self.animation_count += 1
        self.rect = self.image.get_rect(topleft=(self.rect.x, self.rect.y))
        self.mask = pygame.mask.from_surface(self.image)

        if self.animation_count // self.ANIMATION_DELAY > len(sprites):
            self.animation_count = 0
        
class Fruits(Object):
    ANIMATION_DELAY = 3
    def __init__(self , x , y , width , height , name):
        super().__init__(x , y , width , height , "fruits")
        self.fruit = load_sprite_sheets("Items" , "Fruits" , width , height)
        self.image = self.fruit[name][0]
        self.mask = pygame.mask.from_surface(self.image)
        self.animation_count = 0
        self.animation_name = name
        self.time = 1

    def loop(self):

        sprites = self.fruit[self.animation_name]
        sprite_index = (self.animation_count //self.ANIMATION_DELAY) % len(sprites)  
        self.image = sprites[sprite_index]
        self.animation_count += 1
        self.rect = self.image.get_rect(topleft=( self.rect.x , self.rect.y))
        self.mask = pygame.mask.from_surface(self.image)    

        if self.animation_name == "Collected":
            self.time += 1
            if self.time > FPS:
                self.rect.y = 1000
                self.time = 0
        elif self.animation_count // self.ANIMATION_DELAY > len(sprites):
            self.animation_count = 0

class Flag(Object):
    ANIMATION_DELAY = 3
        
    def __init__(self , x , y , width , height):
        super().__init__(x , y , width , height , "Flag")
         
        self.flag = load_sprite_sheets( "Items" , "Checkpoints" , width , height )
        self.image = self.flag["Checkpoint1"][0]
        self.mask = pygame.mask.from_surface(self.image)
        self.animation_count = 0
        self.animation_name = "Checkpoint1"

    def loop(self):

        sprites = self.flag[self.animation_name]
        sprite_index = (self.animation_count //self.ANIMATION_DELAY) % len(sprites)  
        self.image = sprites[sprite_index]
        self.animation_count += 1

        self.rect = self.image.get_rect(topleft=(self.rect.x, self.rect.y))
        self.mask = pygame.mask.from_surface(self.image)     
        if self.animation_count // self.ANIMATION_DELAY > len(sprites):
            self.animation_count = 0

class Chainsaw(Object):
    
    ANIMATION_DELAY = 3

    def __init__(self , x , y , width , height , p1 , p2 , vel):
        super().__init__(x , y , width , height , "Chain_saw" )

        self.chain = load_sprite_sheets("Traps" , "Saw" , width , height)
        self.image = self.chain["on"][0]
        self.mask = pygame.mask.from_surface(self.image)
        self.animation_count = 0
        self.animation_name = "on"
        self.vel = vel
        self.p1 = p1
        self.p2 = p2
    
    def loop(self):

        sprites = self.chain[self.animation_name]
        sprite_index = (self.animation_count //self.ANIMATION_DELAY) % len(sprites)
        self.image = sprites[sprite_index]
        self.animation_count += 1
        self.image = pygame.transform.scale(self.image,(100,100)).convert_alpha()
        self.rect = self.image.get_rect(topleft=(self.rect.x, self.rect.y))
        self.mask = pygame.mask.from_surface(self.image)

        if self.animation_count // self.ANIMATION_DELAY > len(sprites):
            self.animation_count = 0
        self.move()
    
    def move(self ):

        if self.rect.x < self.p1:
            self.rect.x = self.p1+1
            self.vel *= -1
        elif self.rect.x > self.p2:
            self.rect.x = self.p2-1
            self.vel *= -1

        self.rect.x += self.vel

class Enemy(Object):

    ANIMATION_DELAY = 9

    def __init__(self , x , y):
        super().__init__(0 , 0 , x , y)

        self.enemyes = [pygame.image.load( join ( BASE_DIR, "assets" , "enemy", f"attack_{i}.png" ) ).convert_alpha() for i in range( 1 , 11 )]
        self.image = self.enemyes[0]
        self.rect = pygame.Surface.get_rect(self.image)
        self.animation_count = 0
        self.rect.x = x
        self.rect.y = y
        self.animation_name = "Frog"
        self.name = "Frog"
    
    def loop(self):
        if self.rect.x <= offset_x + 935:
            self.image = self.enemyes[(self.animation_count // self.ANIMATION_DELAY) % 10]
        else:
            y = [self.enemyes[0] ,self.enemyes[9]]
            self.image = y[(self.animation_count // self.ANIMATION_DELAY) % 2]
        self.animation_count += 1
        width , height = self.image.get_width() , self.image.get_height()
        self.image = pygame.transform.scale( self.image , ( width * 2.5 , height * 2.5 ) ).convert_alpha()
        self.rect = self.image.get_rect(topleft=(self.rect.x , self.rect.y))
        self.mask = pygame.mask.from_surface(self.image)

        if self.animation_count // self.ANIMATION_DELAY > 10:
            self.animation_count = 0
    
class gate(Object): 

    def __init__(self, x, y, size):
        super().__init__(x, y, size , size) 

        path = join(BASE_DIR, "assets", "Terrain", "Terrain.png")
        image = pygame.image.load(path).convert_alpha()
        surface = pygame.Surface((size , size), pygame.SRCALPHA, 32)
        rect = pygame.Rect(0 , 64 , 48 , 48)#96,64
        surface.blit(image, (0 , 0), rect)
        self.image = pygame.transform.scale2x(surface)  
        self.rect.x = x
        self.rect.y = y
        self.name = self.animation_name = "Gate"   
        self.time = 0

    def loop(self, player):

        if self.animation_name == "Gate_open":
            self.time += 1
            if self.time > 60:
                player.rect.y = 1500
                player.rect.x = x_spawn
                global offset_x
                offset_x = -200

class score(Object):

    ANIMATION_DELAY = 3
        
    def __init__(self , x , y , width , height):
        super().__init__(x , y , width , height , "score")
         
        self.sprites = [pygame.transform.scale2x(pygame.image.load( join( BASE_DIR, "assets" , "Menu" , "Levels" , str(i) + ".png" ) ).convert_alpha()).convert_alpha() for i in range(1,51)]
        self.image = self.sprites[SCORE - 1]
        self.mask = pygame.mask.from_surface(self.image)
        self.animation_count = 0
        self.animation_name = "Checkpoint1"
        self.side = pygame.image.load( join( BASE_DIR, "assets" , "MainCharacters" , "VirtualGuy", "fall.png")).convert_alpha()

    def loop(self):

        self.image = self.sprites[SCORE - 1]
        self.rect = self.image.get_rect(topleft=(self.rect.x, self.rect.y))
        self.mask = pygame.mask.from_surface(self.image)     
             

def get_background(name):

    image = pygame.image.load( join( BASE_DIR, "assets" , "Background" , name ) )
    _ , _ , width , height = image.get_rect()
    tiles = []

    for i in range(WIDTH // width + 1):
        for j in range(-HEIGHT // height,HEIGHT // height + 1):
            pos = (i * width , j * height)
            tiles.append(pos)

    return tiles , image

def draw(window , background , bg_image , player , objects , offset_x , c , s):

    for tile in background:
        a,b = tile
        window.blit(bg_image , (a,b+c))
            

    for obj in objects:
        obj.draw(window, offset_x)

    player.draw(window, offset_x)

    if SCORE >= 1:
        window.blit(pygame.transform.scale(s.image , ( 40 , 40 )).convert_alpha() , (50 , 10))
        window.blit(pygame.transform.scale(s.side , (50 , 50 )).convert_alpha() , ( 0 , 0))

    pygame.display.update()

def handle_vertical_collision(player , objects , dy):

    collided_objects = []

    for obj in objects:

        if pygame.sprite.collide_mask(player , obj) and obj.animation_name != "Collected":
            
            if obj.animation_name != "Gate_open":

                if dy > 0 :
                    player.rect.bottom = obj.rect.top
                    player.landed()
                elif dy < 0:
                    player.rect.top = obj.rect.bottom
                    player.hit_head()

                if obj.animation_name == "Apple":
                    obj.animation_name = "Collected"
                    global SCORE
                    SCORE +=1

                if obj.animation_name == "Gate":
                    obj.animation_name = "Gate_open"

                collided_objects.append(obj)

    return collided_objects

def collide(player , objects , dx):
   
    player.move(dx , 0)
    player.update()
    collided_object = None

    for obj in objects:

        if pygame.sprite.collide_mask(player , obj) and obj.animation_name != "Collected":
            if obj.animation_name != "Gate_open":

                if obj.animation_name in ["Apple" , "Orange" , "Melon" , "Pineapple" , "Strawberry" , "Bananas" , "Cherries"] :
                    obj.animation_name = "Collected"
                    global SCORE
                    SCORE +=1
                
                if obj.animation_name == "Gate":
                    obj.animation_name = "Gate_open"

                collided_object = obj                

                break

    player.move(-dx, 0)
    player.update()

    return collided_object

def handle_move(player , objects):

    keys = pygame.key.get_pressed()
    player.x_vel = 0
    collide_left = collide(player , objects , -PLAYER_VEL * 2)
    collide_right = collide(player , objects , PLAYER_VEL * 2)

    if keys[pygame.K_LEFT] and not collide_left:
        player.move_left(PLAYER_VEL)
    if keys[pygame.K_RIGHT] and not collide_right:
        player.move_right(PLAYER_VEL)

    vertical_collide = handle_vertical_collision(player , objects , player.y_vel)
    to_check = [collide_left , collide_right , *vertical_collide]

    for obj in to_check:

        if obj and obj.name in ["fire" , "Chain_saw" , "Frog"]:
            player.make_hit()

async def main(window):

    clock = pygame.time.Clock()
    
    background, bg_image = get_background("Yellow.png")
    block_size = 96
    c = 1

    

    enemy = Enemy(block_size*10-20, HEIGHT - block_size * 5+30)

    f1= Flag(x_spawn,HEIGHT-block_size*3-30,64,64)

    player = Player(x_spawn-30,y_spawn, 50, 50)

    end = gate(- 13 * block_size , HEIGHT - 5 * block_size , block_size )
    
    s = score(10,10,64,64)

    fire= [Fire(100, HEIGHT - block_size - 64, 16, 32),
           Fire(-32+-4, HEIGHT - block_size - 64, 16, 32),
           Fire(block_size*8+32,HEIGHT-block_size*4, 16, 32 , 0)]
    
    for i in fire: i.on()

    fruits = [
        
        Fruits(block_size * 2 + 10 , HEIGHT - block_size * 4 - 60 , 32 , 32 , "Apple"),
        Fruits(block_size * 3 + 10 , HEIGHT - block_size * 4 - 60 , 32 , 32 , "Apple"),
        Fruits(block_size * 4 + 10 , HEIGHT - block_size * 4 - 60 , 32 , 32 , "Apple"),
        Fruits(block_size * 8 + 10 , HEIGHT - block_size * 5 - 60 , 32 , 32 , "Melon"),
        Fruits(block_size * 9 + 10 , HEIGHT - block_size * 5 - 60 , 32 ,32 , "Melon"),
        Fruits(block_size * 12 + 35 , HEIGHT - block_size * 3 - 60 , 32 , 32 , "Orange"),
        Fruits(block_size * 13 + 25 , HEIGHT - block_size * 3 - 60 , 32 , 32 , "Orange"),
        Fruits(block_size * 14 + 5 , HEIGHT - block_size * 3 - 60 , 32 , 32 , "Orange"),
        Fruits(-block_size * 13 + 10 , HEIGHT - block_size * 2 - 90 , 32 , 32 , "Cherries"),
        Fruits(-block_size * 13 + 60 , HEIGHT - block_size * 2 - 90 , 32 ,32 , "Cherries"),
        Fruits(-block_size * 13 + 110 , HEIGHT - block_size * 2 -90 , 32 ,32 , "Cherries"),
        Fruits(-block_size * 13 + 40 , HEIGHT - block_size * 1 - 120 , 32 , 32 , "Cherries"),
        Fruits(-block_size * 13 + 90 , HEIGHT - block_size * 1 - 120 , 32 , 32 , "Cherries"),
        Fruits(-block_size * 13 + 60 , HEIGHT - block_size * 1 - 60 , 32 , 32 , "Cherries"),
        Fruits(-block_size * 13 , HEIGHT - block_size * 1 - 60 , 32 , 32 , "Cherries"),
    *[Fruits(block_size * i + 10 , HEIGHT - block_size * 1 - 60 , 32 ,32 ,"Orange") for i in range ( 9 , 15 )],
    *[Fruits(block_size * i - 5 , HEIGHT - block_size * 2 - 60 , 32 , 32 , "Orange") for i in range( 12 , 15 )],
    *[Fruits(-block_size *i + 20 , HEIGHT - block_size * 4 - 60 , 32 , 32 , "Pineapple") for i in range ( 3 , 6 )],
    *[Fruits(-block_size *i + 20 , HEIGHT - block_size * 6 - 60 , 32 , 32 , "Bananas") for i in range ( 6 , 8 )]
    
    ]
    Chainsaws = [
        
        Chainsaw(block_size * 7 , HEIGHT - block_size - block_size // 2, 38 , 38 , block_size * 5 , block_size * 8 , 2),
        Chainsaw(block_size * 6 , HEIGHT - block_size - block_size // 2 , 38 , 38 , block_size * 5 , block_size * 8 , - 2)
        
        ]
    floor = [
        Block( i * block_size , HEIGHT - block_size , block_size) for i in range(-WIDTH // block_size , (WIDTH * 2) // block_size-10)]
    left_world = [
        Block( 15 * block_size , HEIGHT - i * block_size , block_size ) for i in range( 1 , HEIGHT // block_size + 2 )]
    right_world = [
        Block( - 14 * block_size , HEIGHT - i * block_size , block_size ) for i in range( 1 , HEIGHT // block_size + 2 )]
    objects = [

        *Chainsaws , *floor , *left_world , *right_world ,
        
        Block( 0 , HEIGHT - block_size * 2 , block_size ),
        Block(block_size * 3 , HEIGHT - block_size * 4 , block_size),
        Block(block_size * 2 , HEIGHT - block_size * 4 , block_size),
        Block(block_size * 4 , HEIGHT - block_size * 4 , block_size),
        Block(block_size * 9 , HEIGHT - block_size * 5 , block_size),
        Block(block_size * 11 , HEIGHT - block_size * 3 , block_size),
        Block(block_size * 9 , HEIGHT - block_size * 4 , block_size),
        Block(block_size * 9 , HEIGHT - block_size * 3 , block_size),
        Block(block_size * 8 , HEIGHT - block_size * 5 , block_size),
        Block(block_size * 10 , HEIGHT - block_size * 3 , block_size),
        Block(-block_size * 3 , HEIGHT - block_size * 4 , block_size),
        Block(-block_size * 4 , HEIGHT - block_size * 4 , block_size),
        Block(-block_size * 5 , HEIGHT - block_size * 4 , block_size),
        Block(-block_size * 6 , HEIGHT - block_size * 4 , block_size),
        Block(-block_size * 6 , HEIGHT - block_size * 5 , block_size),
        Block(-block_size * 7 , HEIGHT - block_size * 6 , block_size),
        Block(-block_size * 6 , HEIGHT - block_size * 6 , block_size),
        Block(-block_size * 13 , HEIGHT - block_size * 4 , block_size),
        Block(-block_size * 12 , HEIGHT - block_size * 4 , block_size),
        
        *fire , *fruits , enemy , end
        
        ]

    global offset_x
    scroll_area_width = 200

    run = True

    while run:

        clock.tick(FPS)

        for event in pygame.event.get():

            if event.type == pygame.QUIT:
                run = False

                break

            if event.type == pygame.KEYDOWN :

                if (event.key == pygame.K_SPACE or event.key == pygame.K_UP) and player.jump_count < 2:
                    player.jump()

        if end.animation_name == "Gate_open" and end in objects :
            objects.remove(end)

        end.loop(player)
        f1.loop()
        player.loop(FPS)
        for i in fire:i.loop()
        for i in fruits :i.loop()
        for i in Chainsaws:i.loop()
        enemy.loop()
        s.loop()


        c += 1
        if c >= FPS:
            c = 0


        handle_move(player , objects)

        draw(window , background , bg_image , player , objects+[ f1 ] , offset_x , c , s)


        if ( ( player.rect.right - offset_x >= WIDTH - scroll_area_width ) and player.x_vel > 0) or (
                (player.rect.left - offset_x <= scroll_area_width) and player.x_vel < 0):
            offset_x += player.x_vel

        await asyncio.sleep(0)


if __name__ == "__main__":
    asyncio.run(main(window))
