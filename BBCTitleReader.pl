#!/usr/bin/perl
#use LWP::Simple;
#use Data::Dumper;
#use HTML::TreeBuilder;
#use HTML::Element;
#use HTML::Entities;
use XML::Simple;
use Data::Dumper;

print "Reading xml file\n";
#open (FILE, "<bbcPhotos.xml") or die "file could not be created $!";
#while (<FILE>) { print $_; }

# create object
$xml = new XML::Simple;

# read XML file
$data = $xml->XMLin("bbcPhotos.xml");
#print "$data->{photos}";
print Dumper($data->{photos}[0]->{topic});
print Dumper($data->{photos}[1]->{topic});
print Dumper($data->{photos}[2]->{topic});
print Dumper($data->{photos}[3]->{topic});