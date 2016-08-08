# Compiler and linker
CXX            += -std=c++14
CPPFLAGS        = -DDEBUG
CXXFLAGS	= -O3 -g  # -mcore-avx2
CXXFLAGS       += -Wall
LDFLAGS	    	= 
LDLIBS          = 
CXXFILT	    	= c++filt

#-------------------------------------------------------------------------------

# Compile a C++ file, and generate automatic dependencies.
%.o:	    	    	%.cc
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) $< -c -o $@

# Generate assembler for a C++ file.
%.s:	    	    	%.cc force
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) $< -S -o $@

# Generate assembler for a C++ file, demangling C++ names.
%.ss:	    	    	%.cc force
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) $< -S -o - | $(CXXFILT) > $@

# Link an executable. 
%:  	    	    	%.o
%:  	    	    	%.o 
	$(CXX) $(CXXFLAGS) $(LDFLAGS) $^ $(LDLIBS) -o $@

#-------------------------------------------------------------------------------

PROGRAMS    	= sum

.PHONY: all
all:			$(PROGRAMS)

$(PROGRAMS): %:  	%.o json.o

# Use this target as a dependency to force another target to be rebuilt.
.PHONY: force
force: ;

