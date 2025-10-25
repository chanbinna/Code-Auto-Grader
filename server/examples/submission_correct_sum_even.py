def solve(nums):
    """Return the sum of even numbers in the list nums."""
    return sum(x for x in nums if x % 2 == 0)

if __name__ == '__main__':
    print(solve([1,2,3,4]))
