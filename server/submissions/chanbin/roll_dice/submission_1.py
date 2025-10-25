import random

def roll_dice(n):
    total = 0
    for _ in range(n):
        total += random.randint(1, 6)
    return total