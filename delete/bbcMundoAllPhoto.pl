#!/usr/bin/perl
use LWP::Simple;
use Data::Dumper;
use HTML::TreeBuilder;
use HTML::Element;
#use XML::XPath;


sub getPhotoURLs{
	 $page = get("http://www.bbc.co.uk/mundo/video_fotos");
	 #die "Couldn't get it!" unless defined $page;

	  my $tree = HTML::TreeBuilder->new->parse($page); # make a tree structure
	   #$tree = HTML::TreeBuilder->new->parse_file( "bbc\\video_fotos.htm" );
	  
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
		# foreach (@photoSites) {	print $_."\n"; } 
		return @photoSites;
}

my @photoSiteArray = getPhotoURLs;

#pop(@photoSiteArray);pop(@photoSiteArray);pop(@photoSiteArray);pop(@photoSiteArray);pop(@photoSiteArray); pop(@photoSiteArray);pop(@photoSiteArray); 

print '<?xml version="1.0" encoding="ISO-8859-1"?>', "\n<root>\n";
foreach (@photoSiteArray) { 
#print $_;
#print "\n";

   $pagex = get($_);
  my $treex = HTML::TreeBuilder->new->parse($pagex); # 
  # $treex->parse_file("bbc\\samplehtmldump.html");
  #$tree = HTML::TreeBuilder->new->parse_file( "bbc\\120305_galeria_fotos_bonsai_arte_jrg.shtml" );
  # $treex->parse($page);
   
  my $anchorx = $treex->look_down('_tag'=>'div', 'class'=>'g-container fw-story-body');

  #get the H1 of the page and assign to topic local variable
  my $topicx= $treex->look_down('_tag'=>'h1')->as_text , "\n\n";
   
   print '<photos topic="'.$topicx.'" location="xxx">';
   foreach $itemx ($anchorx->look_down('class'=>'content')){
     print "\n<photo>\n";
	  print "\t<path>", $itemx->look_down('_tag','a')->attr('href'),"</path>\n";
	  print "\t<caption>", $itemx->look_down('_tag'=>'div', 'class'=>'body')->as_text ,"</caption>\n";
	  print "</photo>\n";
	  #print $item->dump;
   }
   print "</photos>\n";
   
}
print "\n</root>\n";

 #$page = get("http://www.bbc.co.uk/mundo/video_fotos/2012/03/120305_galeria_fotos_bonsai_arte_jrg.shtml");
# $page = get("http://www.bbc.co.uk/mundo/video_fotos/2012/03/120305_fotos_amistades_inusuales_animales_tsb.shtml");
 #die "Couldn't get it!" unless defined $page;

   
   
  #$h1_links_r = $h1->extract_links();
  #print "Hey, I found ", scalar(@$h1_links_r), " links.\n";
 
  #print "\nDump", $h1->dump; #Prints part of the tree with hierarchiacal numbering 
  #print Dumper $h1;  # Print whole tree structure

=begin
  print "\nDirect Print: $h1 ";  #prints HTML::Element=HASH(0x1db28fc)
  print "\nAs_html: ", $h1->as_HTML, "\n"; 
  print "\nParent: ", $h1->parent;
  print "\nContent list: ", $h1->content_list ,"\n"; 
  print "\nDepth: ", $h1->depth(),"\n";
=cut



