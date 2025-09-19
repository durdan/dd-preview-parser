#!/usr/bin/env python3
"""Command-line interface for markdown converter"""

import argparse
import sys
from pathlib import Path
from converter import MarkdownConverter, ConversionConfig, OutputFormat, ValidationError

def main():
    parser = argparse.ArgumentParser(description='Convert Markdown to PDF/Word with image embedding')
    parser.add_argument('input', help='Input markdown file or directory')
    parser.add_argument('-o', '--output', default='output', 
                       help='Output directory (default: output)')
    parser.add_argument('-f', '--format', choices=['pdf', 'docx', 'both'], 
                       default='both', help='Output format (default: both)')
    parser.add_argument('--pdf-engine', default='xelatex',
                       help='PDF engine for Pandoc (default: xelatex)')
    parser.add_argument('--template', help='Pandoc template file')
    parser.add_argument('--css', help='CSS file for styling')
    parser.add_argument('--reference-doc', help='Reference document for Word styling')
    
    args = parser.parse_args()
    
    # Create configuration
    config = ConversionConfig(
        output_format=OutputFormat(args.format),
        output_dir=args.output,
        pdf_engine=args.pdf_engine,
        template=args.template,
        css_file=args.css,
        reference_doc=args.reference_doc
    )
    
    try:
        converter = MarkdownConverter(config)
        input_path = Path(args.input)
        
        if input_path.is_file():
            print(f"Converting file: {input_path}")
            results = converter.convert_file(input_path)
            print(f"\n✓ Conversion complete!")
            for format_type, output_file in results.items():
                print(f"  {format_type.upper()}: {output_file}")
        
        elif input_path.is_dir():
            print(f"Converting directory: {input_path}")
            results = converter.convert_directory(input_path)
            
            print(f"\n=== Conversion Summary ===")
            success_count = 0
            for filename, result in results.items():
                if 'error' in result:
                    print(f"✗ {filename}: {result['error']}")
                else:
                    print(f"✓ {filename}: {', '.join(result.keys())}")
                    success_count += 1
            
            print(f"\nSuccessfully converted {success_count}/{len(results)} files")
        
        else:
            print(f"Error: {input_path} is not a valid file or directory")
            sys.exit(1)
    
    except ValidationError as e:
        print(f"Validation Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()