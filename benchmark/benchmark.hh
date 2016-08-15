#include <cstdlib>
#include <iostream>
#include <unistd.h>
#include <vector>

//------------------------------------------------------------------------------

inline std::vector<size_t>
parse_lengths(
  int const argc,
  char const* const* const argv)
{
  std::vector<size_t> lengths;
  if (argc == 2)
    lengths.push_back(1 << atoi(argv[1]));
  else if (argc == 3)
    for (size_t i = atoi(argv[1]); i <atoi(argv[2]); ++i)
      lengths.push_back(1 << i);
  else {
    std::cerr << "usage: " << argv[0] << " LENGTH [ LENGTH1 ]\n";
    exit(EXIT_FAILURE);
  }
  return lengths;
}


