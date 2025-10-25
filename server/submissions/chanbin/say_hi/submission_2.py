def solve(nums):
    """Incorrect: sums odd numbers instead of even ones."""
    return sum(x for x in nums if x % 2 != 0)