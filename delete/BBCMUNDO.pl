#!/usr/bin/perl
use LWP::Simple;
use Data::Dumper;
use HTML::TreeBuilder;
use HTML::Element;
use XML::XPath;

# Goes to Main page of Video and photo of BBC Mundo 
# and fetch all the url of photo library
# url of photo library location and description of the library are stored as key-value format
#calling this method will return a hash which contains this key-value object.



sub getPhotoURLs{
	 #$page = get("http://www.bbc.co.uk/mundo/video_fotos");
	 #die "Couldn't get it!" unless defined $page;

	  #my $tree = HTML::TreeBuilder->new->parse($page); # make a tree structure
	   $tree = HTML::TreeBuilder->new->parse_file( "bbc\\video_fotos.htm" );
	  
	  my $anchor = $tree->look_down('_tag'=> 'li', 'class'=>'');

	  my @photoSites;
	  # Add one more element in the hash

		foreach $item ($anchor->look_down( '_tag'=>'li','class'=>'ts-144x81 ts-(none) teaser')){
			# ADD ELEMENTS
			push(@photoSites, 'http://www.bbc.co.uk'. $item->look_down('_tag','a')->attr('href'));
			  #print  $item->look_down('_tag','a')->attr('href'), "\n" ;
			 # print  $item->look_down('_tag','a')->as_text, "\n\n";
			  #$photoLibrary{$item->look_down('_tag','a')->attr('href')} = $item->look_down('_tag','a')->as_text;
			  
			#$item->dump;
		}				
		 foreach (@photoSites) {	print $_."\n"; } 
		return @photoSites;
}