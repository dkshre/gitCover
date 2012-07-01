#!/usr/bin/perl

use LWP::Simple;
#use HTML::LinkExtor;
#use Data::Dumper;

open (WRITEFILE, '>htmldump.html');


my $content = get("http://www.bbc.co.uk/mundo/video_fotos/"); #Get web page in content
die "get failed" if (!defined $content);
#print $content;
print WRITEFILE  "$content" ;

close (WRITEFILE);
print "Done";

#my $parser = HTML::LinkExtor->new(); #create LinkExtor object with no callbacks
#$parser->parse($content); #parse content
#my @links = $parser->links; #get list of links
#print Dumper \@links;  #print list of links out.

