#!/usr/bin/perl
use LWP::Simple;
use Data::Dumper;
use HTML::TreeBuilder;
use HTML::Element;


open (TOFILE, ">bbcMundoPhotoIndex.xml") or die "file could not be created $!";

sub getPhotoURLs{
	 $page = get("http://www.bbc.co.uk/mundo/video_fotos");
	 #die "Couldn't get it!" unless defined $page;

	  my $tree = HTML::TreeBuilder->new->parse($page); # make a tree structure
	   #$tree = HTML::TreeBuilder->new->parse_file( "bbc\\video_fotos.htm" );
	  
	my $anchor = $tree->look_down('_tag'=> 'li', 'class'=>'');
	$anchor = $anchor->look_down('_tag'=> 'ul');
	my @photoSites;
	foreach $item ($anchor->look_down( '_tag'=>'li')){
		# ADD ELEMENTS
		push(@photoSites, 'http://www.bbc.co.uk'. $item->look_down('_tag','a')->attr('href'));
		  #print  $item->look_down('_tag','a')->attr('href'), "\n" ;
		 # print  $item->look_down('_tag','a')->as_text, "\n\n";
		  #$photoLibrary{$item->look_down('_tag','a')->attr('href')} = $item->look_down('_tag','a')->as_text;
	}				
	return @photoSites;
}

my @photoSiteArray = getPhotoURLs;
#@photoSiteArray="http://www.bbc.co.uk/mundo/video_fotos/2012/03/120312_sp_galeria_cebit_adz.shtml";
#shift(@photoSiteArray);
while( scalar @photoSiteArray > 5) { pop(@photoSiteArray);}
#$photoSiteArray[0] = "http://www.bbc.co.uk/mundo/noticias/2012/03/120309_sp_galeria_neon_adz.shtml";
print TOFILE '<?xml version="1.0" encoding="ISO-8859-1"?>';
print TOFILE "\n<root>\n";

my $current_index = 0; 
foreach (@photoSiteArray) { 
	print "Processing current Index $current_index :\n $_ \n";
	$current_index++; 
  
	$page = get($_); #pass current url
	my $tree = HTML::TreeBuilder->new->parse($page); # build tree for that page
	# $treex->parse_file("bbc\\samplehtmldump.html");
	#$tree = HTML::TreeBuilder->new->parse_file( "bbc\\120305_galeria_fotos_bonsai_arte_jrg.shtml" );
	# $treex->parse($page);
   
	my $anchor = $tree->look_down('_tag'=>'div',  'class'=>'g-container fw-story-body'); 
	my $numberOfPhotos = 0;
	if (defined $anchor){
		#get the H1 of the page and assign to topic local variable
		my $topic= $tree->look_down('_tag'=>'h1')->as_text , "\n\n";
   
		print TOFILE '<photos topic="'.$topic.'" location="xxx">';
		
		#$anchor->dump;
	   foreach $item ($anchor->look_down('class'=>'content')){
	      $numberOfPhotos++;
		  print TOFILE "\n<photo>\n";
		  print TOFILE "\t<path>", $item->look_down('_tag','a')->attr('href'),"</path>\n";
		  print TOFILE "\t<caption>", $item->look_down('_tag'=>'div', 'class'=>'body')->as_text ,"</caption>\n";
		  print TOFILE "</photo>\n";
		  #print $item->dump;
	   }
		print "Number of photos for this site : $numberOfPhotos\n\n";
		print TOFILE "</photos>\n";
	}
   

   
}
print TOFILE "\n</root>\n";


  #print "\nDump", $h1->dump; #Prints part of the tree with hierarchiacal numbering 
  #print Dumper $h1;  # Print whole tree structure




