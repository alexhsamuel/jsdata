#include <cstddef>
#include <iomanip>
#include <sys/utsname.h>
#include <time.h>
#include <unistd.h>

#include "benchmark.hh"
#include "timing.hh"

//------------------------------------------------------------------------------

__attribute((noinline)) 
double
sum(
  size_t const length,
  double const* const arr)
{
  double result = 0;
  for (size_t i = 0; i < length; ++i)
    result += arr[i];
  return result;
}


using aslib::json::Json;

Json
to_json(
  Timer::Result const& result)
{
  auto res = Json::object();
  res["name"]       = Json::string(result.name);
  res["time"]       = Json::number(result.time);
  res["samples"]    = Json::number(result.samples);
  res["count"]      = Json::number(result.count);
  return res;
}


Json
make_json_result(
  Timer::Result const& result,
  std::string const& operation,
  std::string const& name,
  std::string const& type,
  size_t const length,
  size_t const mem_size)
{
  auto res = to_json(result);

  res["language"]       = Json::string("c++");
  res["language_ver"]   = Json::string(__VERSION__);

  struct utsname un;
  uname(&un);
  res["arch"]           = Json::string(un.machine);
  res["host"]           = Json::string(un.nodename);
  res["os"]             = Json::string(un.sysname);
  res["os_ver"]         = Json::string(un.version);

  auto const clock = time(nullptr);
  struct tm now;
  gmtime_r(&clock, &now);
  char timestamp[32];
  strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%SZ", &now);
  res["timestamp"]      = Json::string(timestamp);

  res["operation"]      = Json::string(operation);
  res["name"]           = Json::string(name);
  res["type"]           = Json::string(type);
  res["length"]         = Json::number(length);
  res["mem_size"]       = Json::number(mem_size);

  return res;
}


int
main(
  int const argc,
  char const* const* const argv)
{
  auto const lengths = parse_lengths(argc, argv);
  auto const timer = Timer(100);

  for (size_t length : lengths) {
    double* const arr = new double[length];
    for (long i = 0; i < length; ++i)
      arr[i] = 1.0 / (i + 1);

    auto const result = make_json_result(
      timer(sum, length, arr),
      "sum", "sum", "f64", length, length * sizeof(double));
    result.print(std::cout, aslib::json::FORMAT_ONE_LINE);
    std::cout << "\n";
  }
    
  return EXIT_SUCCESS;
}


