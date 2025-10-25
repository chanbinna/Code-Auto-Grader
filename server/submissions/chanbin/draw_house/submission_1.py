import turtle

def draw_house(size):
    t = turtle.Turtle()
    t.speed(5)

    # 🏠 1. Draw the square base
    for _ in range(4):
        t.forward(size)
        t.right(90)

    # 🏠 2. Draw the roof (triangle)
    t.left(45)
    t.forward(size / 1.414)  # diagonal (≈ size / sqrt(2))
    t.right(90)
    t.forward(size / 1.414)
    t.left(45)

    t.hideturtle()
    turtle.done()