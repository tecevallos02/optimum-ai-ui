import { prisma } from './prisma';

export interface RetellCallRequest {
  fromNumber: string;
  toNumber: string;
  agentId: string;
  metadata?: Record<string, any>;
}

export interface RetellCallResponse {
  callId: string;
  status: string;
  message?: string;
}

export class RetellClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.retellai.com/v2';
  }

  async createCall(request: RetellCallRequest): Promise<RetellCallResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/create-phone-call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_number: request.fromNumber,
          to_number: request.toNumber,
          agent_id: request.agentId,
          metadata: request.metadata || {}
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Retell API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        callId: data.call_id,
        status: data.status,
        message: data.message
      };
    } catch (error) {
      console.error('Error creating Retell call:', error);
      throw error;
    }
  }

  async getCall(callId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/get-call/${callId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Retell API error: ${error.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Retell call:', error);
      throw error;
    }
  }

  async listAgents(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/list-agents`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Retell API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      return data.agents || [];
    } catch (error) {
      console.error('Error fetching Retell agents:', error);
      throw error;
    }
  }

  async createAgent(agentData: {
    llm_dynamic_config: any;
    voice: any;
    language: string;
    webhook_url?: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/create-agent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Retell API error: ${error.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Retell agent:', error);
      throw error;
    }
  }
}

export async function getRetellClientForOrg(orgId: string): Promise<RetellClient | null> {
  try {
    // Get the organization's Retell API key
    const phoneNumber = await prisma.phoneNumber.findFirst({
      where: { 
        orgId,
        retellApiKey: { not: null },
        isActive: true
      }
    });

    if (!phoneNumber?.retellApiKey) {
      return null;
    }

    return new RetellClient(phoneNumber.retellApiKey);
  } catch (error) {
    console.error('Error getting Retell client for org:', error);
    return null;
  }
}

export async function createDefaultRetellAgent(orgId: string, apiKey: string): Promise<string | null> {
  try {
    const client = new RetellClient(apiKey);
    
    const agentData = {
      llm_dynamic_config: {
        model: "gpt-4o-mini",
        temperature: 0.7,
        system_prompt: `You are a professional AI receptionist for ${orgId}. 
        Your role is to:
        1. Greet callers professionally
        2. Understand their needs (appointments, information, support)
        3. Schedule appointments when requested
        4. Provide basic information about services
        5. Escalate complex issues to human agents
        6. Be helpful, friendly, and efficient
        
        Always ask for the caller's name and contact information.
        If they want to schedule an appointment, ask for:
        - Preferred date and time
        - Type of service needed
        - Any special requirements
        
        Keep responses concise and professional.`
      },
      voice: {
        voice_id: "sarah",
        speed: 1.0,
        temperature: 0.8
      },
      language: "en-US",
      webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/retell`
    };

    const agent = await client.createAgent(agentData);
    return agent.agent_id;
  } catch (error) {
    console.error('Error creating default Retell agent:', error);
    return null;
  }
}
