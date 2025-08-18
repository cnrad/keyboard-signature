import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { StrokeConfig } from '@/util/constants'

export interface ClaimedSignature {
  id: string
  name: string
  signature_path: string
  claimed_by_user_id: string
  claimed_by_username: string
  claimed_by_avatar: string | null
  created_at: string
  stroke_config: StrokeConfig
  include_numbers: boolean
}


export const useSignatures = () => {
  const [claimedSignatures, setClaimedSignatures] = useState<ClaimedSignature[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchClaimedSignatures = async () => {
    try {
      const { data, error } = await supabase
        .from('claimed_signatures')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching signatures:', error)
        return
      }

      setClaimedSignatures(data || [])
    } catch (error) {
      console.error('Error fetching signatures:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const claimSignature = async (
    name: string,
    signaturePath: string,
    strokeConfig: StrokeConfig,
    includeNumbers: boolean,
    userId: string,
    username: string,
    avatar: string | null
  ) => {
    try {
      console.log('claimSignature called with:', { name, userId, username, avatar });
      
      // Check if signature is already claimed
      console.log('Checking for existing claim...');
      const { data: existingClaim, error: checkError } = await supabase
        .from('claimed_signatures')
        .select('*')
        .eq('name', name.toUpperCase())
        .single()

      console.log('Existing claim check:', { existingClaim, checkError });

      if (existingClaim) {
        console.log('Signature already claimed by:', existingClaim.claimed_by_username);
        return {
          success: false,
          error: 'signature_already_claimed',
          claimedBy: existingClaim.claimed_by_username
        }
      }

      // Claim the signature
      console.log('Inserting new claim...');
      const insertData = {
        name: name.toUpperCase(),
        signature_path: signaturePath,
        claimed_by_user_id: userId,
        claimed_by_username: username,
        claimed_by_avatar: avatar,
        stroke_config: strokeConfig,
        include_numbers: includeNumbers
      };
      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('claimed_signatures')
        .insert(insertData)
        .select()
        .single()

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Error claiming signature:', error)
        return { success: false, error: 'claim_failed' }
      }

      // Add to local state
      if (data) {
        setClaimedSignatures(prev => [data, ...prev])
      }

      console.log('Claim successful!');
      return { success: true, data }
    } catch (error) {
      console.error('Error claiming signature:', error)
      return { success: false, error: 'claim_failed' }
    }
  }

  const getSignatureByName = async (name: string) => {
    try {
      console.log('Fetching signature for name:', name.toUpperCase())
      const { data, error } = await supabase
        .from('claimed_signatures')
        .select('*')
        .eq('name', name.toUpperCase())
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching signature:', error)
        return null
      }

      console.log('Signature fetch result:', data)
      return data
    } catch (error) {
      console.error('Error fetching signature:', error)
      return null
    }
  }

  const getUserClaimedSignatures = (userId: string) => {
    return claimedSignatures.filter(sig => sig.claimed_by_user_id === userId)
  }

  const searchSignatures = (query: string) => {
    if (!query.trim()) return claimedSignatures
    
    const searchTerm = query.toLowerCase().trim()
    return claimedSignatures.filter(sig => 
      sig.name.toLowerCase().includes(searchTerm) ||
      sig.claimed_by_username.toLowerCase().includes(searchTerm)
    )
  }

  useEffect(() => {
    fetchClaimedSignatures()
  }, [])

  return {
    claimedSignatures,
    isLoading,
    claimSignature,
    getSignatureByName,
    getUserClaimedSignatures,
    searchSignatures,
    fetchClaimedSignatures
  }
}