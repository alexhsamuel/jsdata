#pragma once

#include <algorithm>
#include <cassert>
#include <chrono>
#include <cmath>
#include <cstdlib>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <utility>

#include "json.hh"

using aslib::json::Json;

//------------------------------------------------------------------------------

double constexpr MSEC = 1e-3;
double constexpr USEC = 1e-6;
double constexpr NSEC = 1e-9;

using Clock = std::chrono::high_resolution_clock;
using Timestamp = std::chrono::time_point<Clock>;
using Elapsed = double;

inline Elapsed
time_diff(
  Timestamp const start,
  Timestamp const end)
{
  return std::chrono::duration<Elapsed>(end - start).count();
}


inline Elapsed
time_since(
  Timestamp const start)
{
  return time_diff(start, Clock::now());
}


/*
 * Invokes `fn(args...)`, and returns the elapsed time.
 */
template<typename FN, typename ...ARGS>
__attribute((noinline))
inline Elapsed
time_call(
  FN&& fn,
  ARGS&&... args)
{
  auto const start = Clock::now();
  (void) fn(std::forward<ARGS>(args)...);
  auto const end = Clock::now();
  return time_diff(start, end);
}


/*
 * Invokes `fn(args...)`, and returns the elapsed time.
 */
template<typename FN, typename ...ARGS>
__attribute((noinline))
inline Elapsed
time_call(
  size_t const count,
  FN&& fn,
  ARGS&&... args)
{
  auto const start = Clock::now();
  for (size_t i = 0; i < count; ++i)
    (void) fn(std::forward<ARGS>(args)...);
  auto const end = Clock::now();
  return time_diff(start, end);
}


//------------------------------------------------------------------------------

template<typename T>
struct SummaryStats
{
  size_t num_samples;
  T min;
  T max;
  T mean;
  T standard_deviation;
};


/*
 * Computes summary statistics over a number of sample values.
 */
template<typename ITER>
auto
summarize(
  ITER begin,
  ITER end)
{
  using Value = typename std::iterator_traits<ITER>::value_type;

  // Compute moments.
  size_t m0 = 0;
  Value m1 = 0;
  Value m2 = 0;
  for (auto i = begin; i < end; ++i) {
    m0 += 1;
    m1 += *i;
    m2 += *i * *i;
  }

  return SummaryStats<Value>{
    m0,
    *begin,      // FIXME: Wrong!
    *(end - 1),  // FIXME: Wrong!
    m1 / m0,
    sqrt(m2 / m0 - square(m1 / m0)) * m0 / (m0 - 1)
  };
}


template<typename T>
inline SummaryStats<T>
operator/(
  SummaryStats<T> const& stats,
  size_t const scale)
{
  return {
    stats.num_samples,
    stats.min / scale,
    stats.max / scale,
    stats.mean / scale,
    stats.standard_deviation / scale
  };
}


template<typename T>
Json
to_json(
  SummaryStats<T> const& stats)
{
  auto json = Json::object();
  json["num_samples"] = Json((int) stats.num_samples);
  json["min"] = stats.min;
  json["max"] = stats.max;
  json["mean"] = stats.mean;
  json["standard_deviation"] = stats.standard_deviation;
  return json;
}
  

inline
std::string
format_ns(
  Elapsed const elapsed)
{
  double const ns = elapsed * 1e9;
  std::stringstream ss;
  ss << std::setw(12) << std::setprecision(2) << std::fixed << ns << " ns";
  return ss.str();
}


inline std::ostream&
operator<<(
  std::ostream& os,
  SummaryStats<Elapsed> const& stats)
{
  os << "n=" << std::setw(4) << stats.num_samples
     << " (" 
     << std::setw(12) << std::setprecision(2) << std::fixed << stats.mean * 1e9 
     << " ± " 
     << std::setw(11) << std::setprecision(3) << stats.standard_deviation * 1e9
     << ") ns";
  return os;
}


//------------------------------------------------------------------------------

class Timer
{
public:

  struct Result 
  {
    std::string name;
    Elapsed time;
    size_t samples;
    size_t count;
  };

  Timer(
    size_t const samples=100,
    size_t const warm_up=1,
    double const min_sample_time=10 * USEC,
    double const quantile=0.10)
  : samples_(samples),
    warm_up_(warm_up),
    min_sample_time_(min_sample_time),
    quantile_(quantile)
  {
    assert(samples > 0);
    assert(min_sample_time > 0);
    assert(0 <= quantile && quantile < 1);
  }

  template<typename FN, typename ...ARGS>
  Result
  operator()(
    FN&& fn,
    ARGS&&... args)
    const
  {
    // Do some un-timed warm up calls.
    for (size_t i = 0; i < warm_up_; ++i)
      fn(std::forward<ARGS>(args)...);

    // Choose the count so the sample time isn't too small.
    size_t count;
    for (count = 1; 
         time_call(count, fn, std::forward<ARGS>(args)...) < min_sample_time_;
         count *= 10)
      ;

    // Sample the timing.
    std::vector<Elapsed> elapsed;
    for (size_t i = 0; i < samples_; ++i)
      elapsed.push_back(
        time_call(count, fn, std::forward<ARGS>(args)...) / count);
      
    // Use the given quantile as the timing result.
    std::sort(elapsed.begin(), elapsed.end());
    Elapsed const time = elapsed[(size_t) (elapsed.size() * quantile_)];

    return Result{"", time, samples_, count};
  }

private:

  size_t samples_;
  size_t warm_up_;
  double min_sample_time_;
  double quantile_;

};


