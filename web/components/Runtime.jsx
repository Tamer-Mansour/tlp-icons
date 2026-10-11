'use client';
import { useEffect } from 'react';

/** Loads the tlp-icons custom element (our own package) once on the client. */
export default function Runtime() {
  useEffect(() => { import('tlp-icons/element'); }, []);
  return null;
}
