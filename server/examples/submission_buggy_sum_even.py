def solve(nums):
    """Incorrect implementation: sums odd numbers instead of even ones."""
    return sum(x for x in nums if x % 2 != 0)

if __name__ == '__main__':
    print(solve([1,2,3,4]))
