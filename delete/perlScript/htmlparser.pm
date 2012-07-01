#!/usr/bin/perl   
 
#!/usr/bin/perl

# Script to illustrate how to parse a simple XML file
# and print titles of type 'technical'.

use strict;
use XML::Simple;
use Data::Dumper;

my $booklist = XMLin('booklist.html');
# print Dumper($booklist);

foreach my $book (@{$booklist->{book}}) {
	if ($book->{type} eq 'technical') {
		print $book->{title} . "\n";
	}
}
